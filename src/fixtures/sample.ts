import type { Campus, CheckIn, Pet, Schedule } from "../core/types";
import { addDays, startDateFor, startOfDay, toDateKey } from "../core/time";

// Opt-in sample data ("Muat data contoh"): the Home design reference.
// Telur at 75/100 XP, a streak of 3 days, and one class today.
//
// Honesty rules:
// - Every sample check-in is DEMO, so none of it counts as a real arrival (and it is
//   excluded from the on-time percentage and average).
// - The pet's 75 XP is a fixed sample value. XP awards are multiples of 10, so no real
//   history can add up to exactly 75, and the pet total is not cross-checked against
//   check-ins (see design.md).
// - Weather is not part of the sample: today's weather always comes live from Open-Meteo.

export const SAMPLE_CAMPUS: Campus = {
  name: "Kampus Contoh",
  latitude: -6.1754,
  longitude: 106.8272,
  radiusMetres: 300,
  defaultTravelMinutes: 30,
};

export const SAMPLE_PET_XP = 75;

export interface SampleData {
  campus: Campus;
  schedules: Schedule[];
  checkIns: CheckIn[];
  pet: Pet;
}

/** Three finished days before today: [days ago, course, start time, minutes early, XP, weather code]. */
const PAST_DAYS = [
  [3, "Algoritma", "08:00", 14, 20, 0],
  [2, "Basis Data", "10:00", 25, 30, 3],
  [1, "Jaringan Komputer", "13:00", 5, 20, 0],
] as const;

/**
 * Today's sample class starts about 45 minutes from now (rounded up to 5 minutes, never
 * after 23:55), so its check-in window is open and the button can be tried right away.
 */
function todayStartTime(now: Date): string {
  const minutes = Math.min(23 * 60 + 55, Math.ceil((now.getHours() * 60 + now.getMinutes() + 45) / 5) * 5);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/**
 * Build the sample. The user's own campus point is kept when they have one, so the sample
 * class can be tried at their real campus; otherwise a labelled sample campus is used.
 */
export function buildSampleData(now: Date, existingCampus: Campus | null): SampleData {
  const campus = existingCampus ?? SAMPLE_CAMPUS;
  const today = startOfDay(now);

  const schedule = (id: string, courseName: string, day: Date, startTime: string): Schedule => ({
    id,
    courseName,
    dayOfWeek: day.getDay(),
    startTime,
    campusName: campus.name,
    latitude: campus.latitude,
    longitude: campus.longitude,
    radiusMetres: campus.radiusMetres,
    travelMinutes: campus.defaultTravelMinutes,
  });

  const schedules: Schedule[] = [];
  const checkIns: CheckIn[] = [];

  PAST_DAYS.forEach(([daysAgo, courseName, startTime, minutesEarly, xp, weatherCode], index) => {
    const day = addDays(today, -daysAgo);
    const s = schedule(`sample-s${index + 1}`, courseName, day, startTime);
    schedules.push(s);
    const arrival = new Date(startDateFor(day, startTime).getTime() - minutesEarly * 60_000);
    checkIns.push({
      id: `sample-c${index + 1}`,
      scheduleId: s.id,
      date: toDateKey(day),
      arrivalTime: arrival.toISOString(),
      minutesEarly,
      xpEarned: xp,
      weatherCode,
      isDemo: true,
      isAutoGps: false,
      accuracyMetres: null,
      flaggedSuspicious: false,
      status: "early",
    });
  });

  schedules.push(schedule("sample-s4", "Pemrograman Web", today, todayStartTime(now)));

  return {
    campus,
    schedules,
    checkIns,
    pet: {
      totalXp: SAMPLE_PET_XP,
      streakDays: 3,
      lastCheckInDate: toDateKey(addDays(today, -1)),
      badges: [],
    },
  };
}
