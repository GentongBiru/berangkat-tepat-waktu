import { useMemo } from "react";
import { PetArt } from "../components/pets/PetArt";
import { StreakGlyph } from "../components/StreakGlyph";
import { XpProgress } from "../components/XpProgress";
import { BADGE_IDS, badgeEarnings } from "../core/badges";
import { petMood, petProgress, STAGE_MIN_XP, STAGE_ORDER } from "../core/pet";
import { parseDateKey, toDateKey } from "../core/time";
import { useAppState } from "../state/AppStateProvider";
import { formatLongDate } from "../strings/dates";
import { id as t } from "../strings/id";

export function PetSaya() {
  const { pet, schedules, checkIns, now, window } = useAppState();
  const progress = petProgress(pet.totalXp);
  const mood = petMood(checkIns, toDateKey(now));
  // Badge ids come from the pet. Their dates are derived from check-ins, never stored.
  const earnings = useMemo(() => badgeEarnings(schedules, checkIns, window), [schedules, checkIns, window]);
  const stageIndex = STAGE_ORDER.indexOf(progress.stage);

  return (
    <section className="screen">
      <h1>{t.nav.pet}</h1>

      <section className="card pet-hero" aria-label={t.pet.stages[progress.stage]}>
        <PetArt stage={progress.stage} mood={mood} size={192} />
        <h2 className="pet-hero__stage">{t.pet.stages[progress.stage]}</h2>
        <div className="pet-hero__xp">
          <XpProgress totalXp={pet.totalXp} />
        </div>
        <p className="muted pet-hero__note">{t.history.totalXpIncludesDemoNote}</p>
        <p className="pet-hero__streak">
          <StreakGlyph />
          <span>
            {t.petScreen.streakLabel}: <strong>{t.petScreen.streakValue(pet.streakDays)}</strong>
          </span>
        </p>
        <p className="muted">{t.petScreen.growsNote}</p>
      </section>

      <section className="card" aria-labelledby="stages-title">
        <h2 id="stages-title">{t.petScreen.stagesTitle}</h2>
        <ol className="stage-list">
          {STAGE_ORDER.map((stage, index) => {
            const status = index < stageIndex ? "reached" : index === stageIndex ? "current" : "locked";
            return (
              <li
                key={stage}
                className={`stage-list__item stage-list__item--${status}`}
                aria-current={status === "current" ? "step" : undefined}
              >
                <span className="stage-list__name">{t.pet.stages[stage]}</span>
                <span className="muted">{t.petScreen.stageStart(STAGE_MIN_XP[stage])}</span>
                <span className="chip chip--state">
                  {status === "reached"
                    ? t.petScreen.stageReached
                    : status === "current"
                      ? t.petScreen.stageCurrent
                      : t.petScreen.stageLocked}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="card" aria-labelledby="badges-title">
        <h2 id="badges-title">{t.petScreen.badgesTitle}</h2>
        <ul className="badge-grid">
          {BADGE_IDS.map((badge) => {
            const earned = pet.badges.includes(badge);
            const { date, fromDemo } = earnings[badge];
            const parsed = date ? parseDateKey(date) : null;
            return (
              <li key={badge} className={`badge badge--${earned ? "earned" : "locked"}`}>
                <span className="badge__icon" aria-hidden="true">
                  {earned ? <CheckIcon /> : <LockIcon />}
                </span>
                <div>
                  <p className="badge__name">{t.badges[badge]}</p>
                  <p className="badge__status">
                    {earned
                      ? parsed
                        ? t.petScreen.earnedOn(formatLongDate(parsed))
                        : t.petScreen.earnedNoDate
                      : t.petScreen.locked}
                    {earned && fromDemo && (
                      <>
                        {" "}
                        <span className="chip chip--demo">{t.petScreen.fromDemo}</span>
                      </>
                    )}
                  </p>
                  <p className="muted badge__hint">{t.petScreen.badgeHints[badge]}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 22 22",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  focusable: false,
};

function CheckIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 11.5l4 4 8-9" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...iconProps}>
      <rect x="5" y="10" width="12" height="9" rx="2" />
      <path d="M8 10V7.5a3 3 0 0 1 6 0V10" />
    </svg>
  );
}
