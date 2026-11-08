// Core data model. Matches the spec (section 5) plus a few local-only types.
// This module and everything in src/core must stay free of browser APIs.

export interface Schedule {
  id: string;
  courseName: string;
  dayOfWeek: number; // 0 = Sunday .. 6 = Saturday
  startTime: string; // "HH:MM", 24-hour
  campusName: string;
  latitude: number;
  longitude: number;
  radiusMetres: number; // default 300
  travelMinutes: number; // default 30
}

export type CheckInStatus = "early" | "on_time" | "late" | "outside_radius";

export interface CheckIn {
  id: string;
  scheduleId: string;
  date: string; // "YYYY-MM-DD", local
  arrivalTime: string; // ISO timestamp
  minutesEarly: number; // positive = early, negative = late
  xpEarned: number; // base + bonuses
  weatherCode: number | null;
  isDemo: boolean;
  isAutoGps: boolean;
  accuracyMetres: number | null;
  flaggedSuspicious: boolean;
  // "outside_radius" exists for spec parity only. Failed attempts are never saved.
  status: CheckInStatus;
}

export interface Pet {
  totalXp: number;
  streakDays: number;
  lastCheckInDate: string | null;
  badges: string[]; // badge ids
}

export interface Settings {
  autoGpsEnabled: boolean; // default false
  autoGpsWindowBeforeMin: number; // default 60
  autoGpsWindowAfterMin: number; // default 15
}

// Local-only, not part of BackupV1.
export interface Campus {
  name: string;
  latitude: number;
  longitude: number;
  radiusMetres: number;
  defaultTravelMinutes: number;
}

export interface BackupV1 {
  format: "tepatwaktu-backup";
  version: 1;
  exportedAt: string; // ISO timestamp
  schedules: Schedule[];
  checkIns: CheckIn[];
  pet: Pet;
}

export type BadgeId = "pagi_buta" | "streak_5_hari" | "hujan_pemberani";

export type PetStage = "telur" | "bayi" | "remaja" | "dewasa" | "legenda";

/** A position reading. `timestamp` is epoch milliseconds, like GeolocationPosition.timestamp. */
export interface Position {
  latitude: number;
  longitude: number;
  accuracy: number; // metres
  timestamp: number;
}

/** Check-in window around class start, in minutes. */
export interface WindowConfig {
  before: number;
  after: number;
}

export const DEFAULT_WINDOW: WindowConfig = { before: 60, after: 15 };

export const DEFAULT_RADIUS_METRES = 300;
export const DEFAULT_TRAVEL_MINUTES = 30;

export const DEFAULT_SETTINGS: Settings = {
  autoGpsEnabled: false,
  autoGpsWindowBeforeMin: 60,
  autoGpsWindowAfterMin: 15,
};

export const EMPTY_PET: Pet = {
  totalXp: 0,
  streakDays: 0,
  lastCheckInDate: null,
  badges: [],
};
