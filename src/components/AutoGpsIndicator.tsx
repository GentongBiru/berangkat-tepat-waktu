import { formatHHMM } from "../core/time";
import type { UseAutoGps } from "../hooks/useAutoGps";
import { id as t } from "../strings/id";

/**
 * Shows what automatic GPS is doing, always in words (never colour or an animation alone).
 * "GPS aktif, mencari posisi kampus" is shown exactly while location is being watched.
 * The confirm card for a detection is a separate component.
 */
export function AutoGpsIndicator({ auto }: { auto: UseAutoGps }) {
  const { status } = auto;
  if (status === "off" || status === "found") return null;

  return (
    <div className={`auto-gps auto-gps--${status}`} role="status">
      {status === "watching" && (
        <>
          <p className="auto-gps__text">
            <span className="auto-gps__dot" aria-hidden="true" />
            {t.autoGps.indicator}
          </p>
          <button type="button" className="btn btn--secondary auto-gps__button" onClick={auto.stop}>
            {t.autoGps.stop}
          </button>
        </>
      )}
      {status === "idle" && auto.windowOpensAt && (
        <p className="auto-gps__text muted">{t.autoGps.idle(formatHHMM(auto.windowOpensAt))}</p>
      )}
      {status === "stopped" && (
        <>
          <p className="auto-gps__text">{t.autoGps.stopped}</p>
          <button type="button" className="btn btn--secondary auto-gps__button" onClick={auto.resume}>
            {t.autoGps.resume}
          </button>
        </>
      )}
      {status === "denied" && (
        <>
          <p className="auto-gps__text">{t.autoGps.denied}</p>
          <button type="button" className="btn btn--secondary auto-gps__button" onClick={auto.resume}>
            {t.autoGps.retry}
          </button>
        </>
      )}
      {status === "unsupported" && <p className="auto-gps__text">{t.autoGps.unsupported}</p>}
    </div>
  );
}
