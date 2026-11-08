import { BELLY, BODY, BODY_EDGE, Face, Shadow, type PetArtProps } from "./shared";

export function Teen({ mood, size = 160, label }: PetArtProps) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label={label}>
      <Shadow />
      <path
        d="M128 120q26 -2 20 -30"
        fill="none"
        stroke={BODY_EDGE}
        strokeWidth={9}
        strokeLinecap="round"
      />
      <path
        d="M128 120q26 -2 20 -30"
        fill="none"
        stroke={BODY}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path d="M44 62L50 24L74 50Z" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} strokeLinejoin="round" />
      <path d="M116 62L110 24L86 50Z" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx="26" cy="108" rx="10" ry="17" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} transform="rotate(14 26 108)" />
      <ellipse cx="134" cy="108" rx="10" ry="17" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} transform="rotate(-14 134 108)" />
      <ellipse cx="58" cy="146" rx="16" ry="8" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} />
      <ellipse cx="102" cy="146" rx="16" ry="8" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} />
      <ellipse cx="80" cy="100" rx="52" ry="48" fill={BODY} stroke={BODY_EDGE} strokeWidth={4} />
      <ellipse cx="80" cy="118" rx="30" ry="22" fill={BELLY} />
      <Face cx={80} cy={90} gap={19} mood={mood} />
    </svg>
  );
}
