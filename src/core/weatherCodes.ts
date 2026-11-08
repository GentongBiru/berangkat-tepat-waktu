/**
 * Rain rule (WMO weather codes used by Open-Meteo):
 * 51-57 drizzle, 61-67 rain, 80-82 showers, 95-99 thunderstorm.
 * Everything else counts as clear.
 *
 * Decision: rain is decided by weather code only. Only the code is stored on a
 * CheckIn, so the rain bonus and the "Hujan Pemberani" badge date can always be
 * re-derived from saved data.
 */
export type WeatherCategory =
  | "clear"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "showers"
  | "thunder"
  | "snow"
  | "unknown";

/** Group a WMO weather code for display. Rain buffer still uses isRain(). */
export function weatherCategory(code: number): WeatherCategory {
  if (code === 0) return "clear";
  if (code >= 1 && code <= 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 80 && code <= 82) return "showers";
  if (code >= 95 && code <= 99) return "thunder";
  return "unknown";
}

export function isRain(weatherCode: number | null | undefined): boolean {
  if (weatherCode === null || weatherCode === undefined) return false;
  return (
    (weatherCode >= 51 && weatherCode <= 57) ||
    (weatherCode >= 61 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    (weatherCode >= 95 && weatherCode <= 99)
  );
}
