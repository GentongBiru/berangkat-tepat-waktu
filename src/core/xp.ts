export const RAIN_BONUS_XP = 10;
export const STREAK_BONUS_XP = 50;
export const STREAK_BONUS_DAYS = 5;

/**
 * Base XP by minutes early:
 * 30+ -> 50, 15..29 -> 30, 1..14 -> 20, exactly 0 -> 20, late -> 0.
 */
export function baseXp(minutesEarly: number): number {
  if (minutesEarly >= 30) return 50;
  if (minutesEarly >= 15) return 30;
  if (minutesEarly >= 0) return 20;
  return 0;
}

export interface XpBreakdown {
  base: number;
  rainBonus: number;
  streakBonus: number;
  total: number;
}

/** Bonuses apply only to early or on-time arrivals. A late arrival always totals 0. */
export function computeXp(input: {
  minutesEarly: number;
  isRaining: boolean;
  reachedStreakBonus: boolean;
}): XpBreakdown {
  if (input.minutesEarly < 0) {
    return { base: 0, rainBonus: 0, streakBonus: 0, total: 0 };
  }
  const base = baseXp(input.minutesEarly);
  const rainBonus = input.isRaining ? RAIN_BONUS_XP : 0;
  const streakBonus = input.reachedStreakBonus ? STREAK_BONUS_XP : 0;
  return { base, rainBonus, streakBonus, total: base + rainBonus + streakBonus };
}
