import type { PetMood } from "../../core/pet";

// Hand-made pet art. Original shapes only: no fetched images, nothing generated at runtime.
// Colours are hex here because SVG presentation attributes cannot read CSS variables.

export interface PetArtProps {
  mood: PetMood;
  size?: number;
  /** Accessible description, for example "Pet tahap Telur, senang". */
  label: string;
}

export const INK = "#1b2236";
export const BODY = "#8fb4ff";
export const BODY_EDGE = "#1e40af";
export const BELLY = "#e4eeff";
export const CREAM = "#fff3d6";
export const GOLD = "#f2b705";
export const GOLD_EDGE = "#b98400";

interface FaceProps {
  cx: number;
  cy: number;
  /** Half the distance between the eyes. */
  gap: number;
  mood: PetMood;
}

/** Eyes and mouth. The mood changes the shapes, so the state never depends on colour alone. */
export function Face({ cx, cy, gap, mood }: FaceProps) {
  const lx = cx - gap;
  const rx = cx + gap;
  return (
    <g stroke={INK} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {mood === "senang" ? (
        <>
          <path d={`M${lx - 6} ${cy + 2} q6 -9 12 0`} />
          <path d={`M${rx - 6} ${cy + 2} q6 -9 12 0`} />
          <path d={`M${cx - 8} ${cy + 10} q8 9 16 0`} />
        </>
      ) : null}
      {mood === "biasa" ? (
        <>
          <circle cx={lx} cy={cy} r={3.6} fill={INK} stroke="none" />
          <circle cx={rx} cy={cy} r={3.6} fill={INK} stroke="none" />
          <path d={`M${cx - 6} ${cy + 12} q6 4 12 0`} />
        </>
      ) : null}
      {mood === "sedih" ? (
        <>
          <circle cx={lx} cy={cy} r={3.6} fill={INK} stroke="none" />
          <circle cx={rx} cy={cy} r={3.6} fill={INK} stroke="none" />
          <path d={`M${lx - 8} ${cy - 6} L${lx + 2} ${cy - 11}`} />
          <path d={`M${rx + 8} ${cy - 6} L${rx - 2} ${cy - 11}`} />
          <path d={`M${cx - 7} ${cy + 16} q7 -8 14 0`} />
          <path d={`M${rx + 5} ${cy + 7} q4 6 0 9 q-4 -3 0 -9`} fill="#7cc4ff" stroke="none" />
        </>
      ) : null}
    </g>
  );
}

export function Shadow() {
  return <ellipse cx="80" cy="153" rx="42" ry="6" fill={INK} opacity={0.12} />;
}
