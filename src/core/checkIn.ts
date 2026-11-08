import type { BadgeId, CheckIn, CheckInStatus, Pet, Position, Schedule, WindowConfig } from "./types";
import { DEFAULT_WINDOW } from "./types";
import { minutesEarly, startDateFor, toDateKey } from "./time";
import { haversineMetres } from "./geo";
import { isRain } from "./weatherCodes";
import { computeXp, STREAK_BONUS_DAYS, type XpBreakdown } from "./xp";
import { computeStreak, isOnTimeOrEarly } from "./streak";
import { newBadgesFor } from "./badges";
import {
  checkAccuracy,
  checkFreshness,
  checkTimeWindow,
  impliedSpeedKmh,
  isImpossibleTravel,
} from "./antiCheat";

export type CheckInFailureReason =
  | "already_checked_in"
  | "outside_window"
  | "low_accuracy"
  | "stale_position"
  | "outside_radius";

export interface CheckInInput {
  /** Fresh id for the new CheckIn (kept outside so this function stays pure). */
  id: string;
  schedule: Schedule;
  schedules: readonly Schedule[];
  checkIns: readonly CheckIn[];
  pet: Pet;
  now: Date;
  /** Real position reading. Ignored when `isDemo` is true. */
  position: Position | null;
  weatherCode: number | null;
  isDemo: boolean;
  isAutoGps: boolean;
  window?: WindowConfig;
}

export type CheckInDecision =
  | {
      ok: true;
      checkIn: CheckIn;
      xp: XpBreakdown;
      petAfter: Pet;
      newBadges: BadgeId[];
    }
  | {
      ok: false;
      reason: CheckInFailureReason;
      /** Present for "already_checked_in" so the UI can show the existing result. */
      existing?: CheckIn;
    };

function statusFor(minutes: number): CheckInStatus {
  if (minutes > 0) return "early";
  if (minutes === 0) return "on_time";
  return "late";
}

/** Flag when the previous real (non-demo) check-in implies an impossible speed. Never removes XP. */
function isSuspicious(input: CheckInInput): boolean {
  if (input.isDemo) return false;
  const previous = input.checkIns
    .filter((c) => !c.isDemo)
    .reduce<CheckIn | null>(
      (latest, c) => (latest === null || c.arrivalTime > latest.arrivalTime ? c : latest),
      null,
    );
  if (!previous) return false;
  const previousSchedule = input.schedules.find((s) => s.id === previous.scheduleId);
  if (!previousSchedule) return false;

  const speed = impliedSpeedKmh(
    {
      latitude: previousSchedule.latitude,
      longitude: previousSchedule.longitude,
      timeMs: new Date(previous.arrivalTime).getTime(),
    },
    {
      latitude: input.schedule.latitude,
      longitude: input.schedule.longitude,
      timeMs: input.now.getTime(),
    },
  );
  return isImpossibleTravel(speed);
}

export type CheckInFailure = Extract<CheckInDecision, { ok: false }>;

/**
 * The two checks that need no position: duplicate, then time window. The UI runs this
 * BEFORE reading GPS, so a tap that is going to be rejected never reads location.
 * Returns the failure, or null when the check-in may continue.
 */
export function precheckCheckIn(input: {
  schedule: Schedule;
  checkIns: readonly CheckIn[];
  now: Date;
  window?: WindowConfig;
}): CheckInFailure | null {
  const { schedule, now } = input;
  const date = toDateKey(now);
  const existing = input.checkIns.find((c) => c.scheduleId === schedule.id && c.date === date);
  if (existing) return { ok: false, reason: "already_checked_in", existing };

  const classStart = startDateFor(now, schedule.startTime);
  if (checkTimeWindow(now, classStart, input.window ?? DEFAULT_WINDOW) !== "ok") {
    return { ok: false, reason: "outside_window" };
  }
  return null;
}

/**
 * Decide a check-in. Pure: no I/O, no clock, nothing is saved here.
 * Check order: duplicate -> time window -> accuracy -> freshness -> radius, then
 * XP, streak, badges, and the impossible-travel flag.
 * Demo check-ins still respect the duplicate rule and the time window; accuracy,
 * freshness, radius, and travel checks are skipped because the position is simulated.
 */
export function decideCheckIn(input: CheckInInput): CheckInDecision {
  const { schedule, now, isDemo } = input;
  const window = input.window ?? DEFAULT_WINDOW;
  const date = toDateKey(now);

  const early = precheckCheckIn({ schedule, checkIns: input.checkIns, now, window });
  if (early) return early;
  const classStart = startDateFor(now, schedule.startTime);

  let accuracyMetres: number | null = null;
  if (!isDemo) {
    const position = input.position;
    if (!position) return { ok: false, reason: "stale_position" };
    if (checkAccuracy(position.accuracy) !== "ok") return { ok: false, reason: "low_accuracy" };
    if (checkFreshness(now.getTime(), position.timestamp) !== "ok") {
      return { ok: false, reason: "stale_position" };
    }
    const distance = haversineMetres(
      position.latitude,
      position.longitude,
      schedule.latitude,
      schedule.longitude,
    );
    if (distance > schedule.radiusMetres) return { ok: false, reason: "outside_radius" };
    accuracyMetres = position.accuracy;
  }

  const minutes = minutesEarly(classStart, now);
  const status = statusFor(minutes);
  const raining = isRain(input.weatherCode);

  // First pass with 0 XP so the streak can include this check-in.
  const draft: CheckIn = {
    id: input.id,
    scheduleId: schedule.id,
    date,
    arrivalTime: now.toISOString(),
    minutesEarly: minutes,
    xpEarned: 0,
    weatherCode: input.weatherCode,
    isDemo,
    isAutoGps: input.isAutoGps,
    accuracyMetres,
    flaggedSuspicious: isSuspicious(input),
    status,
  };

  const streakAfter = computeStreak(input.schedules, [...input.checkIns, draft], now, window);
  const hadGoodCheckInToday = input.checkIns.some((c) => c.date === date && isOnTimeOrEarly(c));
  // +50 once when a run reaches exactly 5 days: the first good check-in of a day that makes it 5.
  const reachedStreakBonus =
    minutes >= 0 && !hadGoodCheckInToday && streakAfter === STREAK_BONUS_DAYS;

  const xp = computeXp({ minutesEarly: minutes, isRaining: raining, reachedStreakBonus });
  const newBadges = newBadgesFor({
    existing: input.pet.badges,
    minutesEarly: minutes,
    isRaining: raining,
    reachedStreakBonus,
  });

  const checkIn: CheckIn = { ...draft, xpEarned: xp.total };
  const petAfter: Pet = {
    totalXp: input.pet.totalXp + xp.total,
    streakDays: streakAfter,
    lastCheckInDate:
      input.pet.lastCheckInDate && input.pet.lastCheckInDate > date
        ? input.pet.lastCheckInDate
        : date,
    badges: [...input.pet.badges, ...newBadges],
  };

  return { ok: true, checkIn, xp, petAfter, newBadges };
}
