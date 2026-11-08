import type { WindowConfig } from "./types";
import { windowState } from "./time";
import { haversineMetres } from "./geo";

// Honest limits: these are cheap sanity checks, not proof. Browser GPS can be spoofed.
// This module does NOT do WiFi verification, mock-location detection, or server checks.

export const MAX_ACCURACY_METRES = 100;
export const MAX_POSITION_AGE_SECONDS = 120;
export const MAX_PLAUSIBLE_SPEED_KMH = 200;

export type AntiCheatFailure = "outside_window" | "low_accuracy" | "stale_position";

/** Layer 1: only from `before` minutes before start until `after` minutes after start. */
export function checkTimeWindow(
  now: Date,
  classStart: Date,
  window: WindowConfig,
): "ok" | "outside_window" {
  return windowState(now, classStart, window) === "open" ? "ok" : "outside_window";
}

/** Layer 2: accuracy above 100 m is rejected (exactly 100 passes). */
export function checkAccuracy(accuracyMetres: number): "ok" | "low_accuracy" {
  if (!Number.isFinite(accuracyMetres) || accuracyMetres < 0) return "low_accuracy";
  return accuracyMetres > MAX_ACCURACY_METRES ? "low_accuracy" : "ok";
}

/** Layer 3: a position older than 120 s at check-in is rejected (exactly 120 s passes). */
export function checkFreshness(nowMs: number, positionTimestampMs: number): "ok" | "stale_position" {
  const ageSeconds = (nowMs - positionTimestampMs) / 1000;
  return ageSeconds > MAX_POSITION_AGE_SECONDS ? "stale_position" : "ok";
}

export interface TravelPoint {
  latitude: number;
  longitude: number;
  timeMs: number;
}

/**
 * Layer 5 input: implied speed in km/h between two arrivals. Uses campus points only
 * (the user's real coordinates are never stored). Same place -> 0. Distance over zero
 * or negative time -> Infinity.
 */
export function impliedSpeedKmh(from: TravelPoint, to: TravelPoint): number {
  const km = haversineMetres(from.latitude, from.longitude, to.latitude, to.longitude) / 1000;
  if (km === 0) return 0;
  const hours = (to.timeMs - from.timeMs) / 3_600_000;
  if (hours <= 0) return Infinity;
  return km / hours;
}

/** Layer 5: flag (never punish) when the implied speed is above 200 km/h. */
export function isImpossibleTravel(speedKmh: number): boolean {
  return speedKmh > MAX_PLAUSIBLE_SPEED_KMH;
}
