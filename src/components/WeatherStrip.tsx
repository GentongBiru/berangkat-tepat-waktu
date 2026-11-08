import { RAIN_BUFFER_MINUTES, type WeatherSnapshot } from "../core/departure";
import { isRain, weatherCategory } from "../core/weatherCodes";
import type { WeatherStatus } from "../hooks/useWeather";
import { formatMillimetres } from "../strings/dates";
import { id as t } from "../strings/id";

interface WeatherStripProps {
  status: WeatherStatus;
  data: WeatherSnapshot | null;
  onRetry: () => void;
}

/** Current weather for the next class's campus. A failure shows the fallback and blocks nothing. */
export function WeatherStrip({ status, data, onRetry }: WeatherStripProps) {
  if (status === "unavailable") {
    return (
      <div className="weather weather--off" role="status">
        <p>{t.weather.unavailable}</p>
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          {t.weather.reload}
        </button>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="weather" role="status">
        <p className="muted">{t.weather.loading}</p>
      </div>
    );
  }

  const category = weatherCategory(data.weatherCode);
  return (
    <div className="weather" role="status">
      <p>
        <span className="weather__heading">{t.weather.heading}:</span>{" "}
        <strong>{t.weather.categories[category]}</strong> ·{" "}
        {t.weather.precipitation(formatMillimetres(data.precipitation))}
      </p>
      {isRain(data.weatherCode) && <p className="chip chip--rain">{t.weather.rainBuffer(RAIN_BUFFER_MINUTES)}</p>}
    </div>
  );
}
