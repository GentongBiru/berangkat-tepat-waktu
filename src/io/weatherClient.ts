import type { WeatherSnapshot } from "../core/departure";

// Open-Meteo current weather. Free, no API key. This is the ONLY network call in the app.
// Only the campus coordinates are sent, rounded to 2 decimals (about 1 km), which is
// plenty for weather and avoids sending a precise point.

const ENDPOINT = "https://api.open-meteo.com/v1/forecast";
export const WEATHER_TIMEOUT_MS = 8000;
export const WEATHER_CACHE_MS = 10 * 60 * 1000;

export interface FetchWeatherOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

export function weatherUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(2),
    longitude: longitude.toFixed(2),
    current: "weather_code,precipitation",
  });
  return `${ENDPOINT}?${params.toString()}`;
}

/** Validate the response body. Anything unexpected -> null. */
export function parseWeatherResponse(body: unknown): WeatherSnapshot | null {
  if (typeof body !== "object" || body === null) return null;
  const current = (body as { current?: unknown }).current;
  if (typeof current !== "object" || current === null) return null;
  const { weather_code: code, precipitation } = current as Record<string, unknown>;
  if (typeof code !== "number" || !Number.isInteger(code)) return null;
  if (typeof precipitation !== "number" || !Number.isFinite(precipitation) || precipitation < 0) {
    return null;
  }
  return { weatherCode: code, precipitation };
}

/** Fetch current weather. Never throws: any failure, timeout, abort, or bad data -> null. */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  options: FetchWeatherOptions = {},
): Promise<WeatherSnapshot | null> {
  const { signal, timeoutMs = WEATHER_TIMEOUT_MS, fetchFn = fetch } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onOuterAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onOuterAbort, { once: true });
  }

  try {
    const response = await fetchFn(weatherUrl(latitude, longitude), { signal: controller.signal });
    if (!response.ok) return null;
    return parseWeatherResponse(await response.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onOuterAbort);
  }
}

// ---------- in-memory cache (10 minutes, successful results only) ----------

const cache = new Map<string, { at: number; value: WeatherSnapshot }>();

export async function fetchWeatherCached(
  latitude: number,
  longitude: number,
  options: FetchWeatherOptions & { nowMs?: () => number } = {},
): Promise<WeatherSnapshot | null> {
  const nowMs = options.nowMs ?? Date.now;
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && nowMs() - hit.at < WEATHER_CACHE_MS) return hit.value;

  const fresh = await fetchWeather(latitude, longitude, options);
  if (fresh) cache.set(key, { at: nowMs(), value: fresh });
  return fresh;
}

export function clearWeatherCache(): void {
  cache.clear();
}
