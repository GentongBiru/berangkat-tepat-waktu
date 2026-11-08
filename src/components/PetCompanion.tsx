import { petProgress, type PetMood } from "../core/pet";
import type { Pet } from "../core/types";
import { id as t } from "../strings/id";
import { PetArt } from "./pets/PetArt";
import { XpProgress } from "./XpProgress";

/** Pet picture, stage, and XP progress for the Home screen. */
export function PetCompanion({ pet, mood }: { pet: Pet; mood: PetMood }) {
  const { stage } = petProgress(pet.totalXp);
  return (
    <div className="companion">
      <PetArt stage={stage} mood={mood} size={112} />
      <div className="companion__info">
        <p className="companion__stage">{t.pet.stages[stage]}</p>
        <XpProgress totalXp={pet.totalXp} />
      </div>
    </div>
  );
}
