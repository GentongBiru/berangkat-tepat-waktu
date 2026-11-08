import { CREAM, Face, Shadow, type PetArtProps } from "./shared";

export function Egg({ mood, size = 160, label }: PetArtProps) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label={label}>
      <Shadow />
      <path
        d="M80 12C119 12 140 62 140 100c0 33-26 52-60 52S20 133 20 100C20 62 41 12 80 12Z"
        fill={CREAM}
        stroke="#c9a14a"
        strokeWidth={4}
      />
      <circle cx="52" cy="58" r="7" fill="#bcd2ff" />
      <circle cx="108" cy="50" r="5" fill="#bcd2ff" />
      <circle cx="118" cy="122" r="8" fill="#bcd2ff" />
      <circle cx="46" cy="124" r="5" fill="#bcd2ff" />
      <Face cx={80} cy={92} gap={20} mood={mood} />
    </svg>
  );
}
