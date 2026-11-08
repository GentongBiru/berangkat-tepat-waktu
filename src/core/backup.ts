import type { BackupV1, Campus, CheckIn, CheckInStatus, Pet, Schedule } from "./types";
import { isValidHHMM, parseDateKey, toDateKey } from "./time";

// BackupV1 export and import core. Pure: no file or storage access here.
// Import is all-or-nothing. Any invalid entry rejects the whole file.
// A backup is the user's own data and is NOT tamper-proof or verified.

export const BACKUP_FORMAT = "tepatwaktu-backup";
export const BACKUP_VERSION = 1;
/** Maximum accepted backup text length, checked before parsing. */
export const MAX_BACKUP_CHARS = 2_000_000;

export interface BackupState {
  schedules: readonly Schedule[];
  checkIns: readonly CheckIn[];
  pet: Pet;
}

export type BackupParseError = "too_large" | "unrecognised" | "invalid";

export type BackupParseResult =
  | { ok: true; backup: BackupV1 }
  | { ok: false; error: BackupParseError; /** First failing field, for developers only. */ detail?: string };

export interface BackupSummary {
  classCount: number;
  checkInCount: number;
  totalXp: number;
}

// ---------- export ----------

/** Build a BackupV1 from app state. Fields are copied explicitly so nothing extra leaks into the file. */
export function buildBackup(state: BackupState, now: Date): BackupV1 {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    schedules: state.schedules.map(copySchedule),
    checkIns: state.checkIns.map(copyCheckIn),
    pet: copyPet(state.pet),
  };
}

/** "tepatwaktu-backup-v1-YYYY-MM-DD.json" using the local date. */
export function backupFileName(now: Date): string {
  return `tepatwaktu-backup-v1-${toDateKey(now)}.json`;
}

/**
 * Campus settings are not part of BackupV1, but every class carries its own campus point.
 * After an import on a device with no campus yet, use the most common point among the
 * imported classes as the campus default (so adding a class works at once). Null when
 * there are no classes. Never used to replace a campus the user already set.
 */
export function deriveCampus(schedules: readonly Schedule[]): Campus | null {
  if (schedules.length === 0) return null;
  const groups = new Map<string, { sample: Schedule; count: number }>();
  for (const s of schedules) {
    const key = `${s.campusName}|${s.latitude}|${s.longitude}|${s.radiusMetres}`;
    const group = groups.get(key);
    if (group) group.count += 1;
    else groups.set(key, { sample: s, count: 1 });
  }
  let best: { sample: Schedule; count: number } | null = null;
  for (const group of groups.values()) if (best === null || group.count > best.count) best = group;
  const s = (best as { sample: Schedule }).sample;
  return {
    name: s.campusName,
    latitude: s.latitude,
    longitude: s.longitude,
    radiusMetres: s.radiusMetres,
    defaultTravelMinutes: s.travelMinutes,
  };
}

export function summarizeBackup(backup: BackupV1): BackupSummary {
  return {
    classCount: backup.schedules.length,
    checkInCount: backup.checkIns.length,
    totalXp: backup.pet.totalXp,
  };
}

// ---------- import ----------

/**
 * Parse and validate backup text. Order:
 * 1. size cap, JSON parse, `format` and `version` (otherwise "unrecognised")
 * 2. every schedule, check-in, and the pet (otherwise "invalid", whole file rejected)
 */
export function parseBackup(text: string): BackupParseResult {
  if (text.length > MAX_BACKUP_CHARS) return { ok: false, error: "too_large" };

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "unrecognised", detail: "not JSON" };
  }
  if (!isRecord(raw)) return { ok: false, error: "unrecognised", detail: "not an object" };
  if (raw.format !== BACKUP_FORMAT) return { ok: false, error: "unrecognised", detail: "format" };
  if (raw.version !== BACKUP_VERSION) return { ok: false, error: "unrecognised", detail: "version" };

  const invalid = (detail: string): BackupParseResult => ({ ok: false, error: "invalid", detail });

  if (typeof raw.exportedAt !== "string" || !isIsoTimestamp(raw.exportedAt)) {
    return invalid("exportedAt");
  }
  if (!Array.isArray(raw.schedules)) return invalid("schedules");
  if (!Array.isArray(raw.checkIns)) return invalid("checkIns");

  const schedules: Schedule[] = [];
  const scheduleIds = new Set<string>();
  for (let i = 0; i < raw.schedules.length; i++) {
    const parsed = parseSchedule(raw.schedules[i]);
    if (typeof parsed === "string") return invalid(`schedules[${i}].${parsed}`);
    if (scheduleIds.has(parsed.id)) return invalid(`schedules[${i}].id duplicate`);
    scheduleIds.add(parsed.id);
    schedules.push(parsed);
  }

  const checkIns: CheckIn[] = [];
  const checkInIds = new Set<string>();
  for (let i = 0; i < raw.checkIns.length; i++) {
    const parsed = parseCheckIn(raw.checkIns[i]);
    if (typeof parsed === "string") return invalid(`checkIns[${i}].${parsed}`);
    if (checkInIds.has(parsed.id)) return invalid(`checkIns[${i}].id duplicate`);
    checkInIds.add(parsed.id);
    checkIns.push(parsed);
  }

  const pet = parsePet(raw.pet);
  if (typeof pet === "string") return invalid(`pet.${pet}`);

  return {
    ok: true,
    backup: {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: raw.exportedAt,
      schedules,
      checkIns,
      pet,
    },
  };
}

// ---------- entry validators (return the clean copy, or the name of the bad field) ----------

type Rec = Record<string, unknown>;

const isRecord = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
const isNonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isFiniteNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;
const isIsoTimestamp = (v: string): boolean => ISO_TIMESTAMP.test(v) && !Number.isNaN(Date.parse(v));

const STATUSES: readonly CheckInStatus[] = ["early", "on_time", "late", "outside_radius"];

/** Returns a clean Schedule, or the name of the first invalid field. */
export function parseSchedule(value: unknown): Schedule | string {
  if (!isRecord(value)) return "(not an object)";
  if (!isNonEmptyString(value.id)) return "id";
  if (!isNonEmptyString(value.courseName)) return "courseName";
  if (!isInt(value.dayOfWeek) || value.dayOfWeek < 0 || value.dayOfWeek > 6) return "dayOfWeek";
  if (typeof value.startTime !== "string" || !isValidHHMM(value.startTime)) return "startTime";
  if (!isNonEmptyString(value.campusName)) return "campusName";
  if (!isFiniteNumber(value.latitude) || value.latitude < -90 || value.latitude > 90) return "latitude";
  if (!isFiniteNumber(value.longitude) || value.longitude < -180 || value.longitude > 180) return "longitude";
  if (!isFiniteNumber(value.radiusMetres) || value.radiusMetres <= 0) return "radiusMetres";
  if (!isFiniteNumber(value.travelMinutes) || value.travelMinutes < 0) return "travelMinutes";
  return copySchedule(value as unknown as Schedule);
}

/** Returns a clean CheckIn, or the name of the first invalid field. */
export function parseCheckIn(value: unknown): CheckIn | string {
  if (!isRecord(value)) return "(not an object)";
  if (!isNonEmptyString(value.id)) return "id";
  if (!isNonEmptyString(value.scheduleId)) return "scheduleId";
  if (typeof value.date !== "string" || parseDateKey(value.date) === null) return "date";
  if (typeof value.arrivalTime !== "string" || !isIsoTimestamp(value.arrivalTime)) return "arrivalTime";
  if (!isInt(value.minutesEarly)) return "minutesEarly";
  if (!isInt(value.xpEarned) || value.xpEarned < 0) return "xpEarned";
  if (value.weatherCode !== null && !isInt(value.weatherCode)) return "weatherCode";
  if (typeof value.isDemo !== "boolean") return "isDemo";
  if (typeof value.isAutoGps !== "boolean") return "isAutoGps";
  if (value.accuracyMetres !== null && (!isFiniteNumber(value.accuracyMetres) || value.accuracyMetres < 0)) {
    return "accuracyMetres";
  }
  if (typeof value.flaggedSuspicious !== "boolean") return "flaggedSuspicious";
  if (typeof value.status !== "string" || !STATUSES.includes(value.status as CheckInStatus)) return "status";

  const minutes = value.minutesEarly;
  if (value.status === "early" && minutes <= 0) return "status";
  if (value.status === "on_time" && minutes !== 0) return "status";
  if (value.status === "late" && minutes >= 0) return "status";

  return copyCheckIn(value as unknown as CheckIn);
}

/** Returns a clean Pet, or the name of the first invalid field. */
export function parsePet(value: unknown): Pet | string {
  if (!isRecord(value)) return "(not an object)";
  if (!isInt(value.totalXp) || value.totalXp < 0) return "totalXp";
  if (!isInt(value.streakDays) || value.streakDays < 0) return "streakDays";
  if (value.lastCheckInDate !== null) {
    if (typeof value.lastCheckInDate !== "string" || parseDateKey(value.lastCheckInDate) === null) {
      return "lastCheckInDate";
    }
  }
  if (!Array.isArray(value.badges) || !value.badges.every(isNonEmptyString)) return "badges";
  if (new Set(value.badges).size !== value.badges.length) return "badges";
  return copyPet(value as unknown as Pet);
}

// ---------- field-by-field copies (drop unknown fields, never reuse input objects) ----------

function copySchedule(s: Schedule): Schedule {
  return {
    id: s.id,
    courseName: s.courseName,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    campusName: s.campusName,
    latitude: s.latitude,
    longitude: s.longitude,
    radiusMetres: s.radiusMetres,
    travelMinutes: s.travelMinutes,
  };
}

function copyCheckIn(c: CheckIn): CheckIn {
  return {
    id: c.id,
    scheduleId: c.scheduleId,
    date: c.date,
    arrivalTime: c.arrivalTime,
    minutesEarly: c.minutesEarly,
    xpEarned: c.xpEarned,
    weatherCode: c.weatherCode,
    isDemo: c.isDemo,
    isAutoGps: c.isAutoGps,
    accuracyMetres: c.accuracyMetres,
    flaggedSuspicious: c.flaggedSuspicious,
    status: c.status,
  };
}

function copyPet(p: Pet): Pet {
  return {
    totalXp: p.totalXp,
    streakDays: p.streakDays,
    lastCheckInDate: p.lastCheckInDate,
    badges: [...p.badges],
  };
}
