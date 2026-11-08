import { departureInfo } from "../core/departure";
import type { TodayTask } from "../core/tasks";
import { formatHHMM } from "../core/time";
import type { CheckInOutcome } from "../hooks/useCheckIn";
import { routeHref } from "../hooks/useRoute";
import { id as t } from "../strings/id";

interface NextClassPanelProps {
  task: TodayTask;
  now: Date;
  /** Minutes of check-in window before class start. */
  windowBefore: number;
  /** 20 when raining, otherwise 0 (also 0 while weather loads or is unavailable). */
  bufferMinutes: number;
  demoMode: boolean;
  busy: boolean;
  failure: Extract<CheckInOutcome, { kind: "failure" }> | null;
  onCheckIn: () => void;
}

/** Departure time and the blue check-in button. Rendered for the next class only. */
export function NextClassPanel({
  task,
  now,
  windowBefore,
  bufferMinutes,
  demoMode,
  busy,
  failure,
  onCheckIn,
}: NextClassPanelProps) {
  const { schedule } = task;
  const info = departureInfo(task.start, schedule.travelMinutes, bufferMinutes, now);
  const departTime = formatHHMM(info.departure);
  const opensAt = formatHHMM(new Date(task.start.getTime() - windowBefore * 60_000));

  return (
    <div className="next">
      {info.state === "classStarted" ? (
        <p className="next__depart">{t.home.classStarted}</p>
      ) : (
        <>
          <p className="next__depart">
            {info.state === "passed" ? t.home.departPassed(departTime) : t.home.departAt(departTime)}
          </p>
          <p className="muted">
            {bufferMinutes > 0
              ? t.home.travelWithRain(schedule.travelMinutes, bufferMinutes)
              : t.home.travelOnly(schedule.travelMinutes)}
          </p>
        </>
      )}
      {task.window === "before" && <p className="muted">{t.home.checkInOpensAt(opensAt)}</p>}

      <button type="button" className="btn btn--primary btn--block btn--checkin" onClick={onCheckIn} disabled={busy}>
        {busy ? t.home.reading : t.home.checkInButton}
      </button>
      {demoMode && <p className="muted next__demo">{t.home.demoNote}</p>}

      <div className="feedback" aria-live="polite">
        {failure && (
          <>
            <p className="feedback__error">{failure.message}</p>
            {failure.offerDemo && (
              <p className="muted">
                {t.home.gpsFallback} <a href={routeHref("pengaturan")}>{t.home.tryDemo}</a>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
