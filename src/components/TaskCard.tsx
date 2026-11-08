import type { ReactNode } from "react";
import type { TodayTask } from "../core/tasks";
import { formatHHMM } from "../core/time";
import { id as t } from "../strings/id";

interface TaskCardProps {
  task: TodayTask;
  /** Body for the state: result card (selesai), check-in panel (berikutnya), or a hint. */
  children?: ReactNode;
}

/** One class in today's task list. State is shown as an icon plus a text chip, never colour alone. */
export function TaskCard({ task, children }: TaskCardProps) {
  const { schedule, state } = task;
  return (
    <li className={`task task--${state}`} aria-current={state === "berikutnya" ? "step" : undefined}>
      <div className="task__marker" aria-hidden="true">
        <StateIcon state={state} />
      </div>
      <div className="task__main">
        <div className="task__head">
          <p className="task__time">{formatHHMM(task.start)}</p>
          <span className={`chip chip--state chip--${state}`}>{t.home.taskState[state]}</span>
        </div>
        <p className="task__title">{schedule.courseName}</p>
        <p className="muted task__place">{schedule.campusName}</p>
        {children}
      </div>
    </li>
  );
}

function StateIcon({ state }: { state: TodayTask["state"] }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    focusable: false,
  };
  if (state === "selesai") {
    return (
      <svg {...common}>
        <path d="M4.5 10.5l3.5 3.5 7.5-8.5" />
      </svg>
    );
  }
  if (state === "terlewat") {
    return (
      <svg {...common}>
        <path d="M5 5l10 10M15 5L5 15" />
      </svg>
    );
  }
  if (state === "berikutnya") {
    return (
      <svg {...common}>
        <circle cx="10" cy="10" r="3.5" fill="currentColor" />
        <circle cx="10" cy="10" r="7.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="10" cy="10" r="6.5" />
    </svg>
  );
}
