import type { WindowConfig } from "./types";

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Parse "HH:MM" (24-hour). Returns null when invalid. */
export function parseHHMM(value: string): { hours: number; minutes: number } | null {
  const match = HHMM.exec(value);
  if (!match) return null;
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

export const isValidHHMM = (value: string): boolean => parseHHMM(value) !== null;

/** Local-timezone "YYYY-MM-DD". */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Parse "YYYY-MM-DD" to a local midnight Date. Returns null when invalid. */
export function parseDateKey(key: string): Date | null {
  const match = DATE_KEY.exec(key);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

/** Local midnight of the given date (returns a copy). */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Copy of `date` shifted by whole calendar days (local time). */
export function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** The class start moment on the calendar day of `day`. Throws on invalid "HH:MM". */
export function startDateFor(day: Date, startTime: string): Date {
  const parsed = parseHHMM(startTime);
  if (!parsed) throw new Error(`Invalid start time: ${startTime}`);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), parsed.hours, parsed.minutes, 0, 0);
}

/** Drop seconds and milliseconds (returns a copy). */
export function truncateToMinute(date: Date): Date {
  const copy = new Date(date.getTime());
  copy.setSeconds(0, 0);
  return copy;
}

/**
 * Whole minutes from arrival to class start. Both times are truncated to the minute
 * first, so any arrival during the start minute is exactly 0 (on time) and the next
 * minute is -1 (late). Positive = early, negative = late.
 */
export function minutesEarly(start: Date, arrival: Date): number {
  const diffMs = truncateToMinute(start).getTime() - truncateToMinute(arrival).getTime();
  return Math.round(diffMs / 60000);
}

export type WindowState = "before" | "open" | "closed";

/**
 * Check-in window state. Inclusive at both ends, minute precision:
 * 08:00 start with 60/15 -> open from 07:00 through 08:15 (08:16 is closed).
 */
export function windowState(now: Date, start: Date, window: WindowConfig): WindowState {
  const early = minutesEarly(start, now);
  if (early > window.before) return "before";
  if (early < -window.after) return "closed";
  return "open";
}

/** Format a Date as local "HH:MM". */
export function formatHHMM(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}
