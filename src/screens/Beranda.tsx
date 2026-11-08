import { useMemo } from "react";
import { AutoGpsIndicator } from "../components/AutoGpsIndicator";
import { ConfirmArrivalCard } from "../components/ConfirmArrivalCard";
import { NextClassPanel } from "../components/NextClassPanel";
import { PetCompanion } from "../components/PetCompanion";
import { ResultCard } from "../components/ResultCard";
import { StreakGlyph } from "../components/StreakGlyph";
import { StreakWeek } from "../components/StreakWeek";
import { TaskCard } from "../components/TaskCard";
import { WeatherStrip } from "../components/WeatherStrip";
import { weatherBufferMinutes } from "../core/departure";
import { petMood, stageForXp } from "../core/pet";
import { weekStatuses } from "../core/streak";
import { buildTodayTasks } from "../core/tasks";
import { toDateKey } from "../core/time";
import { useAutoGps } from "../hooks/useAutoGps";
import { useCheckIn } from "../hooks/useCheckIn";
import { routeHref } from "../hooks/useRoute";
import { useWeather } from "../hooks/useWeather";
import { useAppState } from "../state/AppStateProvider";
import { formatLongDate } from "../strings/dates";
import { id as t } from "../strings/id";

export function Beranda() {
  const { schedules, checkIns, pet, campus, now, window, demoMode } = useAppState();
  const flow = useCheckIn();

  const tasks = useMemo(
    () => buildTodayTasks(schedules, checkIns, now, window),
    [schedules, checkIns, now, window],
  );
  const next = tasks.find((task) => task.state === "berikutnya") ?? null;

  // Weather is only requested when there is a class today, for that class's campus point.
  const weatherPoint = (next ?? tasks[0])?.schedule ?? null;
  const weather = useWeather(weatherPoint?.latitude ?? null, weatherPoint?.longitude ?? null);
  const bufferMinutes = weatherBufferMinutes(weather.data);
  const auto = useAutoGps({ target: next, weatherCode: weather.data?.weatherCode ?? null, checkIn: flow.checkIn });

  const todayKey = toDateKey(now);
  const mood = petMood(checkIns, todayKey);
  const stage = stageForXp(pet.totalXp);
  const week = useMemo(() => weekStatuses(schedules, checkIns, now, window), [schedules, checkIns, now, window]);

  const outcome = flow.outcome;
  const failure = outcome?.kind === "failure" ? outcome : null;
  const resultCheckIn = outcome && outcome.kind !== "failure" ? outcome.checkIn : null;
  const courseNameOf = (scheduleId: string): string | null =>
    schedules.find((s) => s.id === scheduleId)?.courseName ?? null;

  return (
    <section className="screen">
      <header className="home-header">
        <div>
          <h1>{t.nav.home}</h1>
          <p className="muted home-header__date">{formatLongDate(now)}</p>
        </div>
        <p className="streak-chip">
          <StreakGlyph />
          <span>{t.home.streakChip(pet.streakDays)}</span>
        </p>
      </header>

      <section className="card" aria-label={t.nav.pet}>
        <PetCompanion pet={pet} mood={mood} />
        <StreakWeek days={week} />
      </section>

      <AutoGpsIndicator auto={auto} />
      <ConfirmArrivalCard auto={auto} disabled={flow.busy} />

      {resultCheckIn && outcome && outcome.kind !== "failure" && (
        <ResultCard
          variant="full"
          checkIn={resultCheckIn}
          courseName={courseNameOf(resultCheckIn.scheduleId)}
          stage={stage}
          xp={outcome.kind === "success" ? outcome.xp : undefined}
          newBadges={outcome.kind === "success" ? outcome.newBadges : undefined}
          stageUp={outcome.kind === "success" ? outcome.stageUp : null}
          notice={outcome.kind === "existing" ? t.checkInErrors.alreadyCheckedIn : undefined}
          onDismiss={flow.dismiss}
        />
      )}

      {!campus && schedules.length === 0 ? (
        <section className="card" aria-labelledby="first-run-title">
          <h2 id="first-run-title">{t.home.firstRunTitle}</h2>
          <p>{t.home.firstRunBody}</p>
          <a className="btn btn--primary" href={routeHref("pengaturan")}>
            {t.home.openSettings}
          </a>
        </section>
      ) : tasks.length === 0 ? (
        <section className="card" aria-labelledby="no-class-title">
          <h2 id="no-class-title">{t.home.todayTitle}</h2>
          <p>{schedules.length === 0 ? t.home.noSchedulesYet : t.home.noClassesToday}</p>
          <a className="btn btn--secondary" href={routeHref("pengaturan")}>
            {t.home.addClassLink}
          </a>
        </section>
      ) : (
        <>
          <WeatherStrip status={weather.status} data={weather.data} onRetry={weather.retry} />
          <section aria-labelledby="today-title">
            <h2 id="today-title">{t.home.todayTitle}</h2>
            <ul className="task-list">
              {tasks.map((task) => (
                <TaskCard key={task.schedule.id} task={task}>
                  {task.state === "selesai" && task.checkIn && (
                    <ResultCard
                      variant="compact"
                      checkIn={task.checkIn}
                      courseName={task.schedule.courseName}
                      stage={stage}
                    />
                  )}
                  {task.state === "berikutnya" && (
                    <NextClassPanel
                      task={task}
                      now={now}
                      windowBefore={window.before}
                      bufferMinutes={bufferMinutes}
                      demoMode={demoMode}
                      busy={flow.busy}
                      failure={failure}
                      onCheckIn={() => void flow.checkIn(task.schedule, weather.data?.weatherCode ?? null)}
                    />
                  )}
                  {task.state === "nanti" && (
                    <p className="muted">{t.home.startsAt(task.schedule.startTime)}</p>
                  )}
                  {task.state === "terlewat" && <p className="muted">{t.home.windowClosed}</p>}
                </TaskCard>
              ))}
            </ul>
          </section>
        </>
      )}
    </section>
  );
}
