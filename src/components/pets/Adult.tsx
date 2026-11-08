import type { PetMood } from "../../core/pet";
import { BELLY, BODY, BODY_EDGE, CREAM, Face, Shadow, type PetArtProps } from "./shared";

/** The adult creature without an <svg> wrapper, so Legenda can reuse it. */
export function AdultBody({ mood }: { mood: PetMood }) {
  return (
    <>
      <Shadow />
      <path d="M134 122q24 -2 20 -34" fill="none" stroke={BODY_EDGE} strokeWidth={10} strokeLinecap="round" />
      <path d="M134 122q24 -2 20 -34" fill="none" stroke={BODY} strokeWidth={5} strokeLinecap="round" />
      <path d="M26 92q-24 -8 -14 -36q24 6 32 30Z" fill={CREAM} stroke="#c9a14a" strokeWidth={4} strokeLinejoin="round" />
      <path d="M134 92q24 -8 14 -36q-24 6 -32 30Z" fill={CREAM} stroke="#c9a14a" strokeWidth={4} strokeLinejoin="round" />
      <path d="M50 58L42 20L72 46Z" fill={CREAM} stroke="#c9a14a" strokeWidth={4} strokeLinejoin="round" />
      <path d="M110 58L118 20L88 46Z" fill={CREAM} stroke="#c9a14a" strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx="56" cy="147" rx="17" ry="8" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} />
      <ellipse cx="104" cy="147" rx="17" ry="8" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} />
      <ellipse cx="80" cy="100" rx="58" ry="52" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} />
      <ellipse cx="80" cy="120" rx="32" ry="24" fill={BELLY} />
      <Face cx={80} cy={88} gap={21} mood={mood} />
    </>
  );
}

export function Adult({ mood, size = 160, label }: PetArtProps) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label={label}>
      <AdultBody mood={mood} />
    </svg>
  );
}
