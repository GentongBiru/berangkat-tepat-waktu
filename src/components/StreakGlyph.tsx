/** Original streak glyph: a sun rising over an open book. Decorative; text always sits next to it. */
export function StreakGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7.5 11a4.5 4.5 0 0 1 9 0" />
      <path d="M12 3.5v1.5M5.2 6.2l1 1M18.8 6.2l-1 1M3 11h1.5M19.5 11H21" />
      <path d="M3 14.5c3-1.2 6-1.2 9 .8 3-2 6-2 9-.8V20c-3-1.2-6-1.2-9 .8-3-2-6-2-9-.8z" />
      <path d="M12 15.3V20.8" />
    </svg>
  );
}
