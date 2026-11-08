import { useCallback, useEffect, useState } from "react";
import type { WeatherSnapshot } from "../core/departure";
import { fetchWeatherCached, WEATHER_CACHE_MS } from "../io/weatherClient";

export type WeatherStatus = "idle" | "loading" | "ok" | "unavailable";

export interface WeatherState {
  status: WeatherStatus;
  data: WeatherSnapshot | null;
  /** Fetch again now (the 10-minute cache still applies to successful results). */
  retry: () => void;
}

/**
 * Current weather for a point. "unavailable" means the request failed; callers then use
 * a 0 minute buffer and show the fallback text. A failure never blocks anything else.
 * Pass null coordinates (no campus yet) to stay "idle" with no request.
 */
export function useWeather(latitude: number | null, longitude: number | null): WeatherState {
  const [state, setState] = useState<{ status: WeatherStatus; data: WeatherSnapshot | null }>({
    status: "idle",
    data: null,
  });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    if (latitude === null || longitude === null) {
      setState({ status: "idle", data: null });
      return;
    }

    const controller = new AbortController();
    const load = async () => {
      setState((s) => ({ status: s.data ? s.status : "loading", data: s.data }));
      const result = await fetchWeatherCached(latitude, longitude, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setState(result ? { status: "ok", data: result } : { status: "unavailable", data: null });
    };

    void load();
    const timer = setInterval(() => void load(), WEATHER_CACHE_MS);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [latitude, longitude, attempt]);

  return { status: state.status, data: state.data, retry };
}
