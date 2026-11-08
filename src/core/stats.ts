import type { CheckIn, Pet, Schedule, WindowConfig } from "./types";
import { DEFAULT_WINDOW } from "./types";
import { longestStreak } from "./streak";

export interface HistoryStats {
  /** Percent 0..100 of this month's real check-ins that were early or on time. null when none. */
  onTimePercentThisMonth: number | null;
  /** Mean minutes early over real check-ins (late ones count as negative). null when none. */
  averageMinutesEarly: number | null;
  longestStreak: number;
  totalXp: number;
}

/**
 * Punctuality numbers exclude DEMO check-ins because they are not real arrivals.
 * Total XP comes from the pet, so it includes everything that was awarded.
 */
export function computeStats(
  schedules: readonly Schedule[],
  checkIns: readonly CheckIn[],
  pet: Pet,
  now: Date,
  window: WindowConfig = DEFAULT_WINDOW,
): HistoryStats {
  const real = checkIns.filter((c) => !c.isDemo);
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-`;
  const thisMonth = real.filter((c) => c.date.startsWith(monthPrefix));

  const onTimePercentThisMonth =
    thisMonth.length === 0
      ? null
      : (thisMonth.filter((c) => c.minutesEarly >= 0).length / thisMonth.length) * 100;

  const averageMinutesEarly =
    real.length === 0 ? null : real.reduce((sum, c) => sum + c.minutesEarly, 0) / real.length;

  return {
    onTimePercentThisMonth,
    averageMinutesEarly,
    longestStreak: longestStreak(schedules, checkIns, now, window),
    totalXp: pet.totalXp,
  };
}
