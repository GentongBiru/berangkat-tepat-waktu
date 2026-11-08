import { useCallback, useRef, useState } from "react";
import { decideCheckIn, precheckCheckIn, type CheckInFailureReason } from "../core/checkIn";
import { stageForXp } from "../core/pet";
import type { BadgeId, CheckIn, PetStage, Position, Schedule } from "../core/types";
import type { XpBreakdown } from "../core/xp";
import { GeoError, getCurrentPosition } from "../io/geolocation";
import { createId } from "../io/ids";
import { useAppState } from "../state/AppStateProvider";
import { id as t } from "../strings/id";

export type CheckInOutcome =
  | { kind: "success"; checkIn: CheckIn; xp: XpBreakdown; newBadges: BadgeId[]; stageUp: PetStage | null }
  | { kind: "existing"; checkIn: CheckIn }
  | {
      kind: "failure";
      message: string;
      /** GPS itself failed, so point the user to Demo Mode (a labelled fallback, never a fake success). */
      offerDemo: boolean;
    };

export interface CheckInOptions {
  /**
   * A position the caller already has (a confirmed automatic GPS detection). GPS is not read
   * again and Demo Mode is not used, but every rule still runs on this position at this moment.
   */
  position?: Position;
  isAutoGps?: boolean;
}

export interface UseCheckIn {
  busy: boolean;
  /** Latest result of a tap. Failures are transient messages: nothing is saved for them. */
  outcome: CheckInOutcome | null;
  /**
   * One check-in attempt. Reads location once (or simulates it in Demo Mode), unless a
   * position is passed in. Resolves with the outcome, or null when another attempt is running.
   */
  checkIn: (
    schedule: Schedule,
    weatherCode: number | null,
    options?: CheckInOptions,
  ) => Promise<CheckInOutcome | null>;
  dismiss: () => void;
}

/**
 * One tap, one check-in attempt:
 * 1. duplicate and time-window checks first, so a doomed tap never reads location
 * 2. one getCurrentPosition (skipped in Demo Mode, which simulates the position)
 * 3. decideCheckIn applies accuracy, freshness, radius, XP, streak, badges
 * 4. only a successful decision is saved
 * History is always read fresh from storage (readLatest), so a second open tab cannot
 * cause a decision based on stale data.
 */
export function useCheckIn(): UseCheckIn {
  const { actions } = useAppState();

  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<CheckInOutcome | null>(null);

  const checkIn = useCallback(
    async (
      schedule: Schedule,
      weatherCode: number | null,
      options: CheckInOptions = {},
    ): Promise<CheckInOutcome | null> => {
      if (busyRef.current) return null; // a double tap must not start a second attempt
      busyRef.current = true;
      setBusy(true);
      setOutcome(null);

      const finish = (result: CheckInOutcome): CheckInOutcome => {
        setOutcome(result);
        return result;
      };

      try {
        const before = actions.readLatest();
        const failureOutcome = (reason: CheckInFailureReason): CheckInOutcome => ({
          kind: "failure",
          message: failureMessage(reason, before.window.before, before.window.after),
          offerDemo: false,
        });

        const pre = precheckCheckIn({
          schedule,
          checkIns: before.checkIns,
          now: new Date(),
          window: before.window,
        });
        if (pre) {
          return finish(pre.existing ? { kind: "existing", checkIn: pre.existing } : failureOutcome(pre.reason));
        }

        let position: Position | null = options.position ?? null;
        const providedPosition = position !== null;
        if (!providedPosition && !before.demoMode) {
          try {
            position = await getCurrentPosition();
          } catch (error) {
            return finish({ kind: "failure", message: geoMessage(error), offerDemo: true });
          }
        }

        // Read again: it may have changed while waiting for the GPS (or in another tab).
        const state = actions.readLatest();
        const decision = decideCheckIn({
          id: createId(),
          schedule,
          schedules: state.schedules,
          checkIns: state.checkIns,
          pet: state.pet,
          now: new Date(),
          position,
          weatherCode,
          // A position handed in by a confirmed automatic detection is a real reading, never Demo.
          isDemo: providedPosition ? false : state.demoMode,
          isAutoGps: options.isAutoGps ?? false,
          window: state.window,
        });

        if (!decision.ok) {
          return finish(
            decision.existing
              ? { kind: "existing", checkIn: decision.existing }
              : failureOutcome(decision.reason),
          );
        }

        const saved = actions.recordCheckIn(decision.checkIn, decision.petAfter);
        if (!saved) {
          const existing = actions
            .readLatest()
            .checkIns.find((c) => c.scheduleId === schedule.id && c.date === decision.checkIn.date);
          return finish(existing ? { kind: "existing", checkIn: existing } : failureOutcome("already_checked_in"));
        }

        const beforeStage = stageForXp(state.pet.totalXp);
        const afterStage = stageForXp(decision.petAfter.totalXp);
        return finish({
          kind: "success",
          checkIn: decision.checkIn,
          xp: decision.xp,
          newBadges: decision.newBadges,
          stageUp: afterStage !== beforeStage ? afterStage : null,
        });
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [actions],
  );

  const dismiss = useCallback(() => setOutcome(null), []);

  return { busy, outcome, checkIn, dismiss };
}

function failureMessage(reason: CheckInFailureReason, before: number, after: number): string {
  switch (reason) {
    case "outside_window":
      return t.checkInErrors.outsideWindow(before, after);
    case "low_accuracy":
      return t.checkInErrors.lowAccuracy;
    case "stale_position":
      return t.checkInErrors.stalePosition;
    case "outside_radius":
      return t.checkInErrors.outsideRadius;
    case "already_checked_in":
      return t.checkInErrors.alreadyCheckedIn;
  }
}

function geoMessage(error: unknown): string {
  if (error instanceof GeoError) {
    if (error.kind === "permission_denied") return t.checkInErrors.permissionDenied;
    if (error.kind === "unsupported") return t.checkInErrors.unsupported;
  }
  return t.checkInErrors.positionUnavailable;
}
