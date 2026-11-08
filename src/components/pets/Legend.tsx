import { useId } from "react";
import { AdultBody } from "./Adult";
import { GOLD, GOLD_EDGE, type PetArtProps } from "./shared";

/** Legenda: the adult creature with a glow and a crown. */
export function Legend({ mood, size = 160, label }: PetArtProps) {
  const glowId = useId();
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label={label}>
      <defs>
        <radialGradient id={glowId}>
          <stop offset="55%" stopColor={GOLD} stopOpacity={0.45} />
          <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx="80" cy="84" r="80" fill={`url(#${glowId})`} />
      <AdultBody mood={mood} />
      <path
        d="M58 50L62 28L72 40L80 24L88 40L98 28L102 50Z"
        fill={GOLD}
        stroke={GOLD_EDGE}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
