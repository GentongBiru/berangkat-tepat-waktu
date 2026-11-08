import type { WeekDay } from "../core/streak";
import { id as t } from "../strings/id";

/** Seven-day row ending today. Each day has an icon AND a hidden text status, never colour alone. */
export function StreakWeek({ days }: { days: readonly WeekDay[] }) {
  return (
    <ol className="streak-week" aria-label={t.home.streakWeekLabel}>
      {days.map((day) => (
        <li
          key={day.dateKey}
          className={`streak-day streak-day--${day.status}${day.isToday ? " streak-day--today" : ""}`}
          aria-current={day.isToday ? "date" : undefined}
        >
          <span className="streak-day__name" aria-hidden="true">
            {t.daysShort[day.dayOfWeek]}
          </span>
          <span className="streak-day__mark" aria-hidden="true">
            <DayIcon status={day.status} />
          </span>
          <span className="sr-only">
            {t.days[day.dayOfWeek]}: {t.home.weekStatus[day.status]}
          </span>
        </li>
      ))}
    </ol>
  );
}

function DayIcon({ status }: { status: WeekDay["status"] }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    focusable: false,
  };
  if (status === "good") {
    return (
      <svg {...common}>
        <path d="M3.5 8.5l3 3 6-7" />
      </svg>
    );
  }
  if (status === "missed") {
    return (
      <svg {...common}>
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    );
  }
  if (status === "pending") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M5 8h6" />
    </svg>
  );
}
