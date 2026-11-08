import { isRain } from "./weatherCodes";
import { minutesEarly, truncateToMinute } from "./time";

export const RAIN_BUFFER_MINUTES = 20;

export type DepartureState = "upcoming" | "passed" | "classStarted";

export interface DepartureInfo {
  departure: Date;
  /**
   * upcoming: leave at or after now. passed: the departure minute is already behind us
   * but the class has not started. classStarted: the start minute has arrived, so a
   * departure time no longer helps.
   */
  state: DepartureState;
}

export function departureInfo(
  classStart: Date,
  travelMinutes: number,
  bufferMinutes: number,
  now: Date,
): DepartureInfo {
  const departure = departureTime(classStart, travelMinutes, bufferMinutes);
  if (minutesEarly(classStart, now) <= 0) return { departure, state: "classStarted" };
  const passed = truncateToMinute(now).getTime() > truncateToMinute(departure).getTime();
  return { departure, state: passed ? "passed" : "upcoming" };
}

export interface WeatherSnapshot {
  weatherCode: number;
  precipitation: number; // mm, shown in the UI; the rain decision uses the code only
}

/** +20 minutes when raining, +0 when clear or when weather data is unavailable. */
export function weatherBufferMinutes(weather: WeatherSnapshot | null): number {
  if (!weather) return 0;
  return isRain(weather.weatherCode) ? RAIN_BUFFER_MINUTES : 0;
}

/** departure = classStart - travelMinutes - weatherBufferMinutes */
export function departureTime(
  classStart: Date,
  travelMinutes: number,
  bufferMinutes: number,
): Date {
  return new Date(classStart.getTime() - (travelMinutes + bufferMinutes) * 60_000);
}
