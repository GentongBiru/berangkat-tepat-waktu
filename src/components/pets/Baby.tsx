import { BELLY, BODY, BODY_EDGE, Face, Shadow, type PetArtProps } from "./shared";

export function Baby({ mood, size = 160, label }: PetArtProps) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label={label}>
      <Shadow />
      <circle cx="52" cy="62" r="13" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} />
      <circle cx="108" cy="62" r="13" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} />
      <ellipse cx="58" cy="144" rx="15" ry="8" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} />
      <ellipse cx="102" cy="144" rx="15" ry="8" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} />
      <ellipse cx="80" cy="102" rx="46" ry="42" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} />
      <ellipse cx="80" cy="118" rx="26" ry="19" fill={BELLY} />
      <Face cx={80} cy={94} gap={17} mood={mood} />
    </svg>
  );
}
