import type { Campus, CheckIn, Pet, Schedule, Settings } from "../core/types";
import { DEFAULT_SETTINGS, EMPTY_PET } from "../core/types";
import { parseCheckIn, parsePet, parseSchedule } from "../core/backup";

// Versioned localStorage access. Reads never throw: anything missing, corrupt, or
// unreadable falls back to first-run defaults. Only app keys are touched.
//
// Several tabs can be open at once. Each tab holds the app state in memory, so the
// provider keeps a RAW snapshot (the exact stored text per key) and uses reloadChanged()
// to pick up only the keys another tab changed, before every write and on storage events.

const PREFIX = "otp.v1.";

export const STORAGE_KEYS = {
  schedules: `${PREFIX}schedules`,
  checkIns: `${PREFIX}checkIns`,
  pet: `${PREFIX}pet`,
  settings: `${PREFIX}settings`,
  campus: `${PREFIX}campus`,
  ui: `${PREFIX}ui`,
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

const KEY_LIST = Object.keys(STORAGE_KEYS) as StorageKey[];

/** UI preference kept outside Settings so BackupV1 stays unchanged. */
export interface UiPrefs {
  demoModeEnabled: boolean;
}

export interface AppData {
  schedules: Schedule[];
  checkIns: CheckIn[];
  pet: Pet;
  settings: Settings;
  /** null until the user sets a campus (first run). */
  campus: Campus | null;
  ui: UiPrefs;
}

/** The exact stored text per key (null = not stored). */
export type RawSnapshot = Record<StorageKey, string | null>;

export interface LoadResult {
  data: AppData;
  /** Keys that held unreadable data and were replaced by defaults. */
  issues: StorageKey[];
  /** Raw text read for this load; null when storage is unavailable. */
  raw: RawSnapshot | null;
}

export const DEFAULT_UI: UiPrefs = { demoModeEnabled: false };

export function defaultAppData(): AppData {
  return {
    schedules: [],
    checkIns: [],
    pet: { ...EMPTY_PET, badges: [] },
    settings: { ...DEFAULT_SETTINGS },
    campus: null,
    ui: { ...DEFAULT_UI },
  };
}

/** The browser's localStorage, or null when it is blocked (private mode, policy). */
export function getLocalStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

// ---------- small validators for the local-only keys ----------

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function parseSettings(v: unknown): Settings | null {
  if (!isRecord(v)) return null;
  if (typeof v.autoGpsEnabled !== "boolean") return null;
  if (!isNum(v.autoGpsWindowBeforeMin) || v.autoGpsWindowBeforeMin < 0) return null;
  if (!isNum(v.autoGpsWindowAfterMin) || v.autoGpsWindowAfterMin < 0) return null;
  return {
    autoGpsEnabled: v.autoGpsEnabled,
    autoGpsWindowBeforeMin: v.autoGpsWindowBeforeMin,
    autoGpsWindowAfterMin: v.autoGpsWindowAfterMin,
  };
}

export function parseCampus(v: unknown): Campus | null {
  if (!isRecord(v)) return null;
  if (typeof v.name !== "string" || v.name.trim() === "") return null;
  if (!isNum(v.latitude) || v.latitude < -90 || v.latitude > 90) return null;
  if (!isNum(v.longitude) || v.longitude < -180 || v.longitude > 180) return null;
  if (!isNum(v.radiusMetres) || v.radiusMetres <= 0) return null;
  if (!isNum(v.defaultTravelMinutes) || v.defaultTravelMinutes < 0) return null;
  return {
    name: v.name,
    latitude: v.latitude,
    longitude: v.longitude,
    radiusMetres: v.radiusMetres,
    defaultTravelMinutes: v.defaultTravelMinutes,
  };
}

function parseUi(v: unknown): UiPrefs | null {
  if (!isRecord(v) || typeof v.demoModeEnabled !== "boolean") return null;
  return { demoModeEnabled: v.demoModeEnabled };
}

function parseList<T>(v: unknown, parseOne: (item: unknown) => T | string): T[] | null {
  if (!Array.isArray(v)) return null;
  const out: T[] = [];
  for (const item of v) {
    const parsed = parseOne(item);
    if (typeof parsed === "string") return null; // one bad entry -> whole key falls back
    out.push(parsed);
  }
  return out;
}

const LOADERS: { [K in StorageKey]: (raw: unknown) => AppData[K] | null } = {
  schedules: (raw) => parseList(raw, parseSchedule),
  checkIns: (raw) => parseList(raw, parseCheckIn),
  pet: (raw) => {
    const pet = parsePet(raw);
    return typeof pet === "string" ? null : pet;
  },
  settings: parseSettings,
  campus: parseCampus,
  ui: parseUi,
};

// ---------- read ----------

/** Read every key's raw text. Null when storage is missing or a read throws. */
export function readRaw(store: Storage | null = getLocalStorage()): RawSnapshot | null {
  if (!store) return null;
  const raw = {} as RawSnapshot;
  try {
    for (const key of KEY_LIST) raw[key] = store.getItem(STORAGE_KEYS[key]);
  } catch {
    return null;
  }
  return raw;
}

/** Parse one key. Missing -> default (no issue). Unreadable or invalid -> default + issue. */
function parseRaw<K extends StorageKey>(key: K, text: string | null): { value: AppData[K]; issue: boolean } {
  const fallback = defaultAppData()[key];
  if (text === null) return { value: fallback, issue: false };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { value: fallback, issue: true };
  }
  const parsed = (LOADERS[key] as (raw: unknown) => AppData[K] | null)(json);
  return parsed === null ? { value: fallback, issue: true } : { value: parsed, issue: false };
}

export function loadAll(store: Storage | null = getLocalStorage()): LoadResult {
  const data = defaultAppData();
  const issues: StorageKey[] = [];
  const raw = readRaw(store);
  if (!raw) return { data, issues, raw: null };

  for (const key of KEY_LIST) {
    const result = parseRaw(key, raw[key]);
    (data as unknown as Record<StorageKey, unknown>)[key] = result.value;
    if (result.issue) issues.push(key);
  }
  return { data, issues, raw };
}

export interface ReloadResult {
  /** Same object as `prev` when nothing changed. Unchanged keys keep their object identity. */
  data: AppData;
  raw: RawSnapshot;
  changed: boolean;
}

/**
 * Compare storage with what this tab last saw and re-parse ONLY the keys that differ.
 * Unchanged keys keep their identity, so an open form is not reset by an unrelated change.
 * Returns null when storage cannot be read.
 */
export function reloadChanged(
  store: Storage | null,
  prev: AppData,
  prevRaw: RawSnapshot,
): ReloadResult | null {
  const raw = readRaw(store);
  if (!raw) return null;
  let changed = false;
  const data: AppData = { ...prev };
  for (const key of KEY_LIST) {
    if (raw[key] !== prevRaw[key]) {
      changed = true;
      (data as unknown as Record<StorageKey, unknown>)[key] = parseRaw(key, raw[key]).value;
    }
  }
  return { data: changed ? data : prev, raw, changed };
}

// ---------- write ----------

/**
 * Write every key. Returns false when anything could not be saved (quota, private
 * mode, no storage). On failure previous values are restored best-effort so
 * storage never ends up half-updated.
 */
export function commit(data: AppData, store: Storage | null = getLocalStorage()): boolean {
  if (!store) return false;

  const entries: [StorageKey, unknown][] = [
    ["schedules", data.schedules],
    ["checkIns", data.checkIns],
    ["pet", data.pet],
    ["settings", data.settings],
    ["campus", data.campus],
    ["ui", data.ui],
  ];

  const previous = new Map<string, string | null>();
  try {
    for (const [key] of entries) previous.set(STORAGE_KEYS[key], store.getItem(STORAGE_KEYS[key]));
    for (const [key, value] of entries) {
      if (value === null) store.removeItem(STORAGE_KEYS[key]);
      else store.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    }
    return true;
  } catch {
    for (const [k, old] of previous) {
      try {
        if (old === null) store.removeItem(k);
        else store.setItem(k, old);
      } catch {
        // best effort only
      }
    }
    return false;
  }
}

/** Remove every key this app owns (nothing else in localStorage is touched). */
export function clearAll(store: Storage | null = getLocalStorage()): boolean {
  if (!store) return false;
  try {
    for (const key of Object.values(STORAGE_KEYS)) store.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
