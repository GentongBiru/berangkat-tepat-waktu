import type { CheckIn, PetStage } from "./types";

export type PetMood = "senang" | "biasa" | "sedih";

/**
 * Pet mood reflects today's latest check-in only: happy after an early or on-time one,
 * sad after a late one, calm otherwise. It never stays sad for days.
 */
export function petMood(checkIns: readonly CheckIn[], todayKey: string): PetMood {
  let latest: CheckIn | null = null;
  for (const c of checkIns) {
    if (c.date === todayKey && (latest === null || c.arrivalTime > latest.arrivalTime)) latest = c;
  }
  if (!latest) return "biasa";
  return latest.status === "late" ? "sedih" : "senang";
}

export const STAGE_ORDER: readonly PetStage[] = ["telur", "bayi", "remaja", "dewasa", "legenda"];

/** Minimum total XP for each stage. */
export const STAGE_MIN_XP: Record<PetStage, number> = {
  telur: 0,
  bayi: 100,
  remaja: 300,
  dewasa: 600,
  legenda: 1000,
};

export function stageForXp(totalXp: number): PetStage {
  if (totalXp >= STAGE_MIN_XP.legenda) return "legenda";
  if (totalXp >= STAGE_MIN_XP.dewasa) return "dewasa";
  if (totalXp >= STAGE_MIN_XP.remaja) return "remaja";
  if (totalXp >= STAGE_MIN_XP.bayi) return "bayi";
  return "telur";
}

export interface PetProgress {
  stage: PetStage;
  nextStage: PetStage | null;
  xpIntoStage: number;
  xpToNext: number; // 0 at the final stage
  ratio: number; // 0..1 progress inside the current stage (1 at the final stage)
}

/** Example: 75 XP -> Telur, next Bayi, 75 into stage, 25 to go, ratio 0.75. */
export function petProgress(totalXp: number): PetProgress {
  const xp = Math.max(0, totalXp);
  const stage = stageForXp(xp);
  const index = STAGE_ORDER.indexOf(stage);
  const nextStage = index < STAGE_ORDER.length - 1 ? STAGE_ORDER[index + 1] : null;
  const stageMin = STAGE_MIN_XP[stage];
  if (nextStage === null) {
    return { stage, nextStage, xpIntoStage: xp - stageMin, xpToNext: 0, ratio: 1 };
  }
  const span = STAGE_MIN_XP[nextStage] - stageMin;
  const into = xp - stageMin;
  return { stage, nextStage, xpIntoStage: into, xpToNext: span - into, ratio: into / span };
}
