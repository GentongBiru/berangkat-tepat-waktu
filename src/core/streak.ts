import type { CheckIn, Schedule, WindowConfig } from "./types";
import { DEFAULT_WINDOW } from "./types";
import {
  addDays,
  isValidHHMM,
  parseDateKey,
  startDateFor,
  startOfDay,
  toDateKey,
  windowState,
} from "./time";

/** Walk limit in days (about five years). */
const MAX_WALK_DAYS = 1825;

export const isOnTimeOrEarly = (c: CheckIn): boolean =>
  c.status === "early" || c.status === "on_time";

export type DayStatus = "none" | "good" | "missed" | "pending";

function groupByDate(checkIns: readonly CheckIn[]): Map<string, CheckIn[]> {
  const map = new Map<string, CheckIn[]>();
  for (const c of checkIns) {
    const list = map.get(c.date);
    if (list) list.push(c);
    else map.set(c.date, [c]);
  }
  return map;
}

function earliestCheckInDay(checkIns: readonly CheckIn[]): Date | null {
  let earliest: Date | null = null;
  for (const c of checkIns) {
    const d = parseDateKey(c.date);
    if (d && (earliest === null || d < earliest)) earliest = d;
  }
  return earliest;
}

/**
 * Status of one calendar day, using the CURRENT schedule.
 * - none: no classes that weekday (never breaks or extends a streak)
 * - good: at least one early/on-time check-in
 * - missed: classes existed and no early/on-time check-in (a past day, a late
 *   check-in today, or every class window today already closed)
 * - pending: today, no good check-in yet, and a class is still reachable
 */
function dayStatus(
  day: Date,
  now: Date,
  schedules: readonly Schedule[],
  byDate: Map<string, CheckIn[]>,
  window: WindowConfig,
  lateEndsDay: boolean,
): DayStatus {
  const classes = schedules.filter((s) => s.dayOfWeek === day.getDay() && isValidHHMM(s.startTime));
  if (classes.length === 0) return "none";

  const done = byDate.get(toDateKey(day)) ?? [];
  if (done.some(isOnTimeOrEarly)) return "good";

  if (startOfDay(day).getTime() < startOfDay(now).getTime()) return "missed";
  // The current streak drops at once on a late check-in today. The longest streak is
  // computed from completed days only, so it ignores that intra-day dip.
  if (lateEndsDay && done.some((c) => c.status === "late")) return "missed";

  const stillReachable = classes.some(
    (s) =>
      !done.some((c) => c.scheduleId === s.id) &&
      windowState(now, startDateFor(day, s.startTime), window) !== "closed",
  );
  return stillReachable ? "pending" : "missed";
}

/**
 * Current streak in days as of `now`. Walks backward from today:
 * good days count, no-class days are skipped, a missed day stops the walk, and
 * today stays pending (not counted, not breaking) while a class is still reachable.
 * The walk never goes before the first recorded check-in.
 */
export function computeStreak(
  schedules: readonly Schedule[],
  checkIns: readonly CheckIn[],
  now: Date,
  window: WindowConfig = DEFAULT_WINDOW,
): number {
  const earliest = earliestCheckInDay(checkIns);
  if (!earliest) return 0;

  const byDate = groupByDate(checkIns);
  let streak = 0;
  let day = startOfDay(now);
  for (let i = 0; i < MAX_WALK_DAYS && day.getTime() >= earliest.getTime(); i++) {
    const status = dayStatus(day, now, schedules, byDate, window, true);
    if (status === "good") streak += 1;
    else if (status === "missed") break;
    day = addDays(day, -1);
  }
  return streak;
}

export interface WeekDay {
  dateKey: string;
  dayOfWeek: number;
  status: DayStatus;
  isToday: boolean;
}

/**
 * The last `days` calendar days ending today, for the streak row. Days before the first
 * recorded check-in show as "none" (not "missed"), matching how the streak itself is counted.
 */
export function weekStatuses(
  schedules: readonly Schedule[],
  checkIns: readonly CheckIn[],
  now: Date,
  window: WindowConfig = DEFAULT_WINDOW,
  days = 7,
): WeekDay[] {
  const earliest = earliestCheckInDay(checkIns);
  const byDate = groupByDate(checkIns);
  const today = startOfDay(now);
  const out: WeekDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = addDays(today, -i);
    let status = dayStatus(day, now, schedules, byDate, window, true);
    if (status === "missed" && (earliest === null || day.getTime() < earliest.getTime())) {
      status = "none";
    }
    out.push({ dateKey: toDateKey(day), dayOfWeek: day.getDay(), status, isToday: i === 0 });
  }
  return out;
}

/**
 * Longest run of good days over the recorded history. Computed from completed days:
 * today only counts once it has a good check-in, and a late check-in today does not
 * end a run while another class that day is still reachable.
 */
export function longestStreak(
  schedules: readonly Schedule[],
  checkIns: readonly CheckIn[],
  now: Date,
  window: WindowConfig = DEFAULT_WINDOW,
): number {
  const earliest = earliestCheckInDay(checkIns);
  if (!earliest) return 0;

  const byDate = groupByDate(checkIns);
  const today = startOfDay(now);
  let run = 0;
  let best = 0;
  let day = earliest;
  for (let i = 0; i < MAX_WALK_DAYS && day.getTime() <= today.getTime(); i++) {
    const status = dayStatus(day, now, schedules, byDate, window, false);
    if (status === "good") {
      run += 1;
      if (run > best) best = run;
    } else if (status === "missed") {
      run = 0;
    }
    day = addDays(day, 1);
  }
  return best;
}
