import { useMemo } from "react";
import { minutesText } from "../components/ResultCard";
import { computeStats } from "../core/stats";
import { weatherCategory } from "../core/weatherCodes";
import type { CheckIn } from "../core/types";
import { parseDateKey } from "../core/time";
import { routeHref } from "../hooks/useRoute";
import { useAppState } from "../state/AppStateProvider";
import { formatIsoTime, formatLongDate } from "../strings/dates";
import { id as t } from "../strings/id";

const oneDecimal = (value: number) => value.toLocaleString("id-ID", { maximumFractionDigits: 1 });

export function Riwayat() {
  const { schedules, checkIns, pet, now, window } = useAppState();
  const stats = useMemo(
    () => computeStats(schedules, checkIns, pet, now, window),
    [schedules, checkIns, pet, now, window],
  );
  // Newest first. Compare as timestamps: imported files may use other UTC offsets.
  const rows = useMemo(
    () => [...checkIns].sort((a, b) => Date.parse(b.arrivalTime) - Date.parse(a.arrivalTime)),
    [checkIns],
  );
  const courseName = (scheduleId: string): string =>
    schedules.find((s) => s.id === scheduleId)?.courseName ?? t.history.deletedClass;

  const average = stats.averageMinutesEarly;

  return (
    <section className="screen">
      <h1>{t.history.title}</h1>

      <section className="card" aria-labelledby="stats-title">
        <h2 id="stats-title">{t.history.statsTitle}</h2>
        <div className="stats">
          <Stat
            label={t.history.onTimeMonth}
            value={
              stats.onTimePercentThisMonth === null
                ? t.history.noData
                : t.history.percent(Math.round(stats.onTimePercentThisMonth))
            }
          />
          <Stat
            label={t.history.averageArrival}
            value={
              average === null
                ? t.history.noData
                : average >= 0
                  ? t.history.averageEarly(oneDecimal(average))
                  : t.history.averageLate(oneDecimal(-average))
            }
          />
          <p className="stats__note">{t.history.realArrivalsOnlyNote}</p>
          <Stat label={t.history.longestStreak} value={t.history.days(stats.longestStreak)} />
          <Stat label={t.history.totalXp} value={`${stats.totalXp} XP`} />
          <p className="stats__note">{t.history.totalXpIncludesDemoNote}</p>
        </div>
      </section>

      <section aria-labelledby="list-title">
        <h2 id="list-title">{t.history.listTitle}</h2>
        {rows.length === 0 ? (
          <div className="card">
            <p>
              <strong>{t.history.empty}</strong>
            </p>
            <p className="muted">{t.history.emptyHint}</p>
            <a className="btn btn--secondary" href={routeHref("beranda")}>
              {t.history.goHome}
            </a>
          </div>
        ) : (
          <ul className="history-list">
            {rows.map((c) => (
              <HistoryRow key={c.id} checkIn={c} course={courseName(c.scheduleId)} />
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <p className="stat__label">{label}</p>
      <p className="stat__value">{value}</p>
    </div>
  );
}

function HistoryRow({ checkIn, course }: { checkIn: CheckIn; course: string }) {
  const day = parseDateKey(checkIn.date);
  const late = checkIn.status === "late";
  const weather =
    checkIn.weatherCode === null
      ? t.history.weatherNone
      : t.history.weatherAt(t.weather.categories[weatherCategory(checkIn.weatherCode)]);

  return (
    <li className="history-item">
      <div className="history-item__top">
        <span className="history-item__date">{day ? formatLongDate(day) : checkIn.date}</span>
        <strong className="history-item__xp">{checkIn.xpEarned > 0 ? t.result.xp(checkIn.xpEarned) : t.result.xpZero}</strong>
      </div>
      <p className="task__title">{course}</p>
      <p>
        {t.result.arrivedAt(formatIsoTime(checkIn.arrivalTime))}
        {" · "}
        <strong className={late ? "result__late" : "result__good"}>{minutesText(checkIn.minutesEarly)}</strong>
      </p>
      <p className="muted history-item__meta">{weather}</p>
      {(checkIn.isDemo || checkIn.flaggedSuspicious) && (
        <p className="history-item__chips">
          {checkIn.isDemo && <span className="chip chip--demo">{t.history.demoLabel}</span>}
          {checkIn.flaggedSuspicious && <span className="chip chip--warn">{t.history.suspiciousLabel}</span>}
        </p>
      )}
    </li>
  );
}
