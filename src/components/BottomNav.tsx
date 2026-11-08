import type { ReactElement } from "react";
import { id } from "../strings/id";
import { routeHref, type Route } from "../hooks/useRoute";

interface Item {
  route: Route;
  label: string;
  icon: ReactElement;
}

// Original, simple line icons. Decorative (aria-hidden); the text label carries the meaning.
const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const ITEMS: readonly Item[] = [
  {
    route: "beranda",
    label: id.nav.home,
    icon: (
      <svg {...iconProps}>
        <path d="M4 11l8-7 8 7" />
        <path d="M6 10v9h12v-9" />
      </svg>
    ),
  },
  {
    route: "pet",
    label: id.nav.pet,
    icon: (
      <svg {...iconProps}>
        <path d="M12 3c3.5 0 6 4.5 6 9a6 6 0 0 1-12 0c0-4.5 2.5-9 6-9z" />
      </svg>
    ),
  },
  {
    route: "riwayat",
    label: id.nav.history,
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    ),
  },
  {
    route: "pengaturan",
    label: id.nav.settings,
    icon: (
      <svg {...iconProps}>
        <path d="M5 7h14M5 12h14M5 17h14" />
        <circle cx="9" cy="7" r="1.6" fill="currentColor" />
        <circle cx="15" cy="12" r="1.6" fill="currentColor" />
        <circle cx="8" cy="17" r="1.6" fill="currentColor" />
      </svg>
    ),
  },
];

export function BottomNav({ current }: { current: Route }) {
  return (
    <nav className="bottom-nav" aria-label={id.shell.mainNavLabel}>
      <ul>
        {ITEMS.map((item) => (
          <li key={item.route}>
            <a
              href={routeHref(item.route)}
              className="bottom-nav__link"
              aria-current={item.route === current ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
