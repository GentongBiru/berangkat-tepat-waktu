import { petProgress, STAGE_MIN_XP } from "../core/pet";
import { id as t } from "../strings/id";

/**
 * XP line, progress bar, and "XP left" line, shared by Beranda and Pet Saya.
 * 75 XP shows "75/100 XP" and "25 XP lagi jadi Bayi". The final stage shows the max message.
 */
export function XpProgress({ totalXp }: { totalXp: number }) {
  const progress = petProgress(totalXp);
  const stageName = t.pet.stages[progress.stage];
  const next = progress.nextStage;

  if (!next) {
    return (
      <>
        <p className="companion__xp">{t.pet.xpOnly(totalXp)}</p>
        <p className="muted companion__next">{t.pet.maxStage}</p>
      </>
    );
  }

  const span = STAGE_MIN_XP[next] - STAGE_MIN_XP[progress.stage];
  return (
    <>
      <p className="companion__xp">{t.pet.xpProgress(totalXp, STAGE_MIN_XP[next])}</p>
      <div
        className="progress"
        role="progressbar"
        aria-label={stageName}
        aria-valuemin={0}
        aria-valuemax={span}
        aria-valuenow={progress.xpIntoStage}
        aria-valuetext={t.pet.progressText(progress.xpIntoStage, span)}
      >
        <div className="progress__bar" style={{ width: `${Math.round(progress.ratio * 100)}%` }} />
      </div>
      <p className="muted companion__next">{t.pet.xpToNext(progress.xpToNext, t.pet.stages[next])}</p>
    </>
  );
}
