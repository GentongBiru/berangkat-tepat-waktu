import type { UseAutoGps } from "../hooks/useAutoGps";
import { id as t } from "../strings/id";

/**
 * Shown when automatic GPS finds the user inside the campus radius. Nothing has been recorded
 * at this point. The check-in is recorded only if the user taps the confirm button.
 */
export function ConfirmArrivalCard({ auto, disabled }: { auto: UseAutoGps; disabled: boolean }) {
  if (auto.status !== "found" || !auto.target) return null;
  const busy = auto.confirming || disabled;
  return (
    <section className="card confirm-arrival" role="status" aria-labelledby="confirm-arrival-title">
      <h2 id="confirm-arrival-title">{t.autoGps.confirmPrompt}</h2>
      <p>{t.autoGps.forClass(auto.target.schedule.courseName)}</p>
      <p className="muted">{t.autoGps.confirmNote}</p>
      <div className="confirm-arrival__actions">
        <button type="button" className="btn btn--primary btn--checkin" onClick={() => void auto.confirm()} disabled={busy}>
          {auto.confirming ? t.autoGps.confirming : t.autoGps.confirm}
        </button>
        <button type="button" className="btn btn--ghost" onClick={auto.decline} disabled={auto.confirming}>
          {t.autoGps.decline}
        </button>
      </div>
    </section>
  );
}
