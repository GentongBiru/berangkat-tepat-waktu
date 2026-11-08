import type { CheckIn, Schedule, WindowConfig } from "./types";
import { DEFAULT_WINDOW } from "./types";
import { isValidHHMM, startDateFor, toDateKey, windowState, type WindowState } from "./time";

export type TaskState = "selesai" | "berikutnya" | "nanti" | "terlewat";

export interface TodayTask {
  schedule: Schedule;
  start: Date;
  state: TaskState;
  window: WindowState;
  /** Today's check-in for this class, if any (real or DEMO). */
  checkIn: CheckIn | null;
}

/**
 * Today's classes in start order, each with a state:
 * - selesai: checked in today
 * - terlewat: check-in window closed with no check-in
 * - berikutnya: the earliest class that is still reachable (window not closed)
 * - nanti: later reachable classes
 * Exactly one class is "berikutnya" when any class is still reachable, and only that
 * class gets the check-in button.
 */
export function buildTodayTasks(
  schedules: readonly Schedule[],
  checkIns: readonly CheckIn[],
  now: Date,
  window: WindowConfig = DEFAULT_WINDOW,
): TodayTask[] {
  const dateKey = toDateKey(now);
  const todays = schedules
    .filter((s) => s.dayOfWeek === now.getDay() && isValidHHMM(s.startTime))
    .map((schedule) => ({ schedule, start: startDateFor(now, schedule.startTime) }))
    .sort(
      (a, b) =>
        a.start.getTime() - b.start.getTime() ||
        a.schedule.courseName.localeCompare(b.schedule.courseName),
    );

  let nextAssigned = false;
  return todays.map(({ schedule, start }) => {
    const checkIn = checkIns.find((c) => c.scheduleId === schedule.id && c.date === dateKey) ?? null;
    const win = windowState(now, start, window);
    let state: TaskState;
    if (checkIn) state = "selesai";
    else if (win === "closed") state = "terlewat";
    else if (!nextAssigned) {
      state = "berikutnya";
      nextAssigned = true;
    } else state = "nanti";
    return { schedule, start, state, window: win, checkIn };
  });
}
