import type { BadgeId, CheckIn, Schedule, WindowConfig } from "./types";
import { DEFAULT_WINDOW } from "./types";
import { isRain } from "./weatherCodes";
import { parseDateKey } from "./time";
import { computeStreak, isOnTimeOrEarly } from "./streak";
import { STREAK_BONUS_DAYS } from "./xp";

export const BADGE_IDS: readonly BadgeId[] = ["pagi_buta", "streak_5_hari", "hujan_pemberani"];

/** Badges a new check-in unlocks that the pet does not have yet. */
export function newBadgesFor(input: {
  existing: readonly string[];
  minutesEarly: number;
  isRaining: boolean;
  reachedStreakBonus: boolean;
}): BadgeId[] {
  const earned: BadgeId[] = [];
  const add = (id: BadgeId) => {
    if (!input.existing.includes(id)) earned.push(id);
  };
  if (input.minutesEarly >= 30) add("pagi_buta");
  if (input.minutesEarly >= 0 && input.isRaining) add("hujan_pemberani");
  if (input.reachedStreakBonus) add("streak_5_hari");
  return earned;
}

export interface BadgeEarning {
  /** "YYYY-MM-DD" the badge was first earned, or null when it cannot be derived. */
  date: string | null;
  /** True when the check-in that earned it was DEMO (for the streak badge: a real-only history would not have reached 5). */
  fromDemo: boolean;
}

/**
 * Badge dates are derived from check-ins, never stored (BackupV1 keeps Pet.badges as ids only).
 * The same pass says whether a badge came from a DEMO check-in, so the UI can label it.
 */
export function badgeEarnings(
  schedules: readonly Schedule[],
  checkIns: readonly CheckIn[],
  window: WindowConfig = DEFAULT_WINDOW,
): Record<BadgeId, BadgeEarning> {
  const ordered = [...checkIns].sort((a, b) => Date.parse(a.arrivalTime) - Date.parse(b.arrivalTime));
  const earning = (c: CheckIn | undefined): BadgeEarning => ({ date: c?.date ?? null, fromDemo: c?.isDemo ?? false });

  const pagiButa = earning(ordered.find((c) => c.minutesEarly >= 30));
  const hujan = earning(ordered.find((c) => c.minutesEarly >= 0 && isRain(c.weatherCode)));

  // Replay good days oldest first; the first day whose streak reaches 5 is the badge date.
  let streak5: BadgeEarning = { date: null, fromDemo: false };
  const goodDates = [...new Set(ordered.filter(isOnTimeOrEarly).map((c) => c.date))].sort();
  for (const date of goodDates) {
    const day = parseDateKey(date);
    if (!day) continue;
    const endOfDay = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
    const upTo = checkIns.filter((c) => c.date <= date);
    if (computeStreak(schedules, upTo, endOfDay, window) >= STREAK_BONUS_DAYS) {
      const realOnly = computeStreak(schedules, upTo.filter((c) => !c.isDemo), endOfDay, window);
      streak5 = { date, fromDemo: realOnly < STREAK_BONUS_DAYS };
      break;
    }
  }

  return { pagi_buta: pagiButa, hujan_pemberani: hujan, streak_5_hari: streak5 };
}