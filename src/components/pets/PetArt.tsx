import type { PetMood } from "../../core/pet";
import type { PetStage } from "../../core/types";
import { id as t } from "../../strings/id";
import { Adult } from "./Adult";
import { Baby } from "./Baby";
import { Egg } from "./Egg";
import { Legend } from "./Legend";
import { Teen } from "./Teen";

interface PetArtSwitchProps {
  stage: PetStage;
  mood: PetMood;
  size?: number;
}

/** The pet picture for a stage and mood. */
export function PetArt({ stage, mood, size = 160 }: PetArtSwitchProps) {
  const label = t.pet.artLabel(t.pet.stages[stage], t.pet.moods[mood]);
  const props = { mood, size, label };
  return (
    <span className="pet-art">
      {stage === "telur" && <Egg {...props} />}
      {stage === "bayi" && <Baby {...props} />}
      {stage === "remaja" && <Teen {...props} />}
      {stage === "dewasa" && <Adult {...props} />}
      {stage === "legenda" && <Legend {...props} />}
    </span>
  );
}
