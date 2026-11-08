import type { BadgeId, CheckIn, PetStage } from "../core/types";
import type { XpBreakdown } from "../core/xp";
import { formatIsoTime } from "../strings/dates";
import { id as t } from "../strings/id";
import { PetArt } from "./pets/PetArt";

interface ResultCardProps {
  checkIn: CheckIn;
  /** Course name, or null when the class was deleted. */
  courseName: string | null;
  /** Pet stage after this check-in, for the reaction picture. */
  stage: PetStage;
  variant: "full" | "compact";
  /** Only known right after a check-in. Shown as a breakdown in the full card. */
  xp?: XpBreakdown;
  newBadges?: readonly BadgeId[];
  stageUp?: PetStage | null;
  /** Extra line, for example when a second tap shows the existing result. */
  notice?: string;
  onDismiss?: () => void;
}

export function minutesText(minutesEarly: number): string {
  if (minutesEarly > 0) return t.result.early(minutesEarly);
  if (minutesEarly === 0) return t.result.onTime;
  return t.result.late(-minutesEarly);
}

function reaction(checkIn: CheckIn): string {
  if (checkIn.status === "late") return t.result.reactionLate;
  return checkIn.minutesEarly >= 30 ? t.result.reactionVeryEarly : t.result.reactionGood;
}

export function ResultCard({
  checkIn,
  courseName,
  stage,
  variant,
  xp,
  newBadges = [],
  stageUp = null,
  notice,
  onDismiss,
}: ResultCardProps) {
  const late = checkIn.status === "late";
  const xpText = checkIn.xpEarned > 0 ? t.result.xp(checkIn.xpEarned) : t.result.xpZero;

  const chips = (
    <>
      {checkIn.isDemo && <span className="chip chip--demo">{t.history.demoLabel}</span>}
      {checkIn.flaggedSuspicious && <span className="chip chip--warn">{t.history.suspiciousLabel}</span>}
    </>
  );

  if (variant === "compact") {
    return (
      <div className="result result--compact">
        <p className="result__line">
          <strong className={late ? "result__late" : "result__good"}>{minutesText(checkIn.minutesEarly)}</strong>
          {" · "}
          {t.result.arrivedAt(formatIsoTime(checkIn.arrivalTime))}
          {" · "}
          <strong>{xpText}</strong> {chips}
        </p>
      </div>
    );
  }

  return (
    <section className="card result result--full" aria-label={t.result.title} role="status">
      <div className="result__head">
        <PetArt stage={stage} mood={late ? "sedih" : "senang"} size={72} />
        <div>
          <h2 className="result__title">
            {courseName ?? t.result.classDeleted} {chips}
          </h2>
          <p className={`result__big ${late ? "result__late" : "result__good"}`}>
            {minutesText(checkIn.minutesEarly)}
          </p>
          <p className="muted">{t.result.arrivedAt(formatIsoTime(checkIn.arrivalTime))}</p>
        </div>
      </div>

      <p className="result__xp">{xpText}</p>
      {xp && xp.total > 0 && (
        <ul className="result__breakdown">
          <li>{t.result.xpBase(xp.base)}</li>
          {xp.rainBonus > 0 && <li>{t.result.xpRain(xp.rainBonus)}</li>}
          {xp.streakBonus > 0 && <li>{t.result.xpStreak(xp.streakBonus)}</li>}
        </ul>
      )}

      <p>{reaction(checkIn)}</p>
      {newBadges.map((badge) => (
        <p key={badge} className="result__badge">
          {t.result.newBadge(t.badges[badge])}
        </p>
      ))}
      {stageUp && <p className="result__badge">{t.result.stageUp(t.pet.stages[stageUp])}</p>}
      <p className="muted">{checkIn.isDemo ? t.result.demoLine : t.result.positionLine}</p>
      {checkIn.isAutoGps && <p className="muted">{t.autoGps.resultNote}</p>}
      {notice && <p className="result__notice">{notice}</p>}
      {onDismiss && (
        <button type="button" className="btn btn--ghost" onClick={onDismiss}>
          {t.home.dismiss}
        </button>
      )}
    </section>
  );
}
