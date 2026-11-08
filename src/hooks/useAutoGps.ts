import { useCallback, useEffect, useRef, useState } from "react";
import { checkAccuracy } from "../core/antiCheat";
import { haversineMetres } from "../core/geo";
import type { TodayTask } from "../core/tasks";
import { toDateKey, windowState } from "../core/time";
import type { Position, WindowConfig } from "../core/types";
import { isGeolocationSupported, observePermission, watchPosition } from "../io/geolocation";
import { useAppState } from "../state/AppStateProvider";
import type { UseCheckIn } from "./useCheckIn";

/**
 * Automatic GPS (v2). Opt-in, default OFF. It is NOT background tracking:
 * - it only runs while the Beranda screen is mounted AND the tab is visible
 * - it only reads location while the next class's check-in window is open
 *   (60 minutes before the class until 15 minutes after it starts)
 * - it never runs in Demo Mode
 * - it never records anything by itself: a detection only produces a confirm card, and the
 *   check-in is recorded after the user taps confirm
 * - the detected position lives in memory only and is dropped on stop. Nothing is stored.
 */
export type AutoGpsStatus =
  | "off" //         toggle off, Demo Mode, no class waiting, or the window just closed: nothing shown
  | "idle" //        on, but the window is not open yet: no location is read
  | "watching" //    window open: location is being watched (indicator shown)
  | "found" //       inside the campus radius: confirm card shown, watching stopped
  | "stopped" //     the user stopped or declined: stays off for this class until re-enabled
  | "denied" //      permission denied or revoked
  | "unsupported"; // the browser has no geolocation

export interface UseAutoGps {
  status: AutoGpsStatus;
  /** True while a confirmed detection is being recorded. */
  confirming: boolean;
  /** When the window opens for the waiting class (for the idle note). */
  windowOpensAt: Date | null;
  /** The class being watched for. */
  target: TodayTask | null;
  stop: () => void;
  /** Re-enable after stop, decline, or denied. */
  resume: () => void;
  decline: () => void;
  /** Record the check-in for the detection. Runs every rule again at this moment. */
  confirm: () => Promise<void>;
}

interface Params {
  /** The next class (state "berikutnya"), or null. */
  target: TodayTask | null;
  weatherCode: number | null;
  checkIn: UseCheckIn["checkIn"];
}

function useTabVisible(): boolean {
  const [visible, setVisible] = useState(() => document.visibilityState === "visible");
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

export function useAutoGps({ target, weatherCode, checkIn }: Params): UseAutoGps {
  const { settings, demoMode, window: checkInWindow, now } = useAppState();
  const enabled = settings.autoGpsEnabled;
  const visible = useTabVisible();

  // One key per class per day, so "stopped" or "denied" ends when the next class or day comes.
  const key = target ? `${target.schedule.id}:${toDateKey(now)}` : null;

  const [stoppedKey, setStoppedKey] = useState<string | null>(null);
  const [deniedKey, setDeniedKey] = useState<string | null>(null);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const [found, setFound] = useState<{ key: string; position: Position } | null>(null);
  const [runId, setRunId] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const status: AutoGpsStatus = (() => {
    if (!enabled || demoMode || !target || !key) return "off";
    if (target.window !== "open") return "idle";
    if (closedKey === key) return "off";
    if (!isGeolocationSupported()) return "unsupported";
    if (stoppedKey === key) return "stopped";
    if (deniedKey === key) return "denied";
    if (found?.key === key) return "found";
    return "watching";
  })();

  // The effect below must not restart every 30 seconds when the clock ticks and the task
  // objects are rebuilt, so the watch callbacks read the latest values through refs.
  const targetRef = useRef<TodayTask | null>(target);
  const windowRef = useRef<WindowConfig>(checkInWindow);
  useEffect(() => {
    targetRef.current = target;
    windowRef.current = checkInWindow;
  });

  const watching = status === "watching" && visible;

  useEffect(() => {
    if (!watching || key === null) return;

    let ended = false;
    let stopWatch: () => void = () => {};
    const end = () => {
      ended = true;
      stopWatch();
    };

    stopWatch = watchPosition(
      (position) => {
        if (ended) return;
        const current = targetRef.current;
        if (!current) return;
        // Fresh clock, not the 30-second tick: a late callback must never act after the window closed.
        if (windowState(new Date(), current.start, windowRef.current) !== "open") {
          end();
          setClosedKey(key);
          return;
        }
        if (checkAccuracy(position.accuracy) !== "ok") return; // keep looking for a better fix
        const { latitude, longitude, radiusMetres } = current.schedule;
        if (haversineMetres(position.latitude, position.longitude, latitude, longitude) > radiusMetres) return;
        end(); // stop watching as soon as we are inside the radius
        setFound({ key, position }); // memory only
      },
      (error) => {
        if (ended) return;
        if (error.kind === "permission_denied") {
          end();
          setDeniedKey(key);
        }
        // Other errors (no fix yet, timeout): the browser keeps trying.
      },
    );

    // Stop at the exact moment the window closes, not at the next 30-second tick.
    const current = targetRef.current;
    const closeAt = current ? current.start.getTime() + (windowRef.current.after + 1) * 60_000 : 0;
    const timer = setTimeout(() => {
      end();
      setClosedKey(key);
    }, Math.max(0, closeAt - Date.now()));

    const unobserve = observePermission((state) => {
      if (state === "denied" && !ended) {
        end();
        setDeniedKey(key);
      }
    });

    return () => {
      end();
      clearTimeout(timer);
      unobserve();
    };
  }, [watching, key, runId]);

  // Drop the detected position as soon as it is no longer needed.
  useEffect(() => {
    if (found && status !== "found") setFound(null);
  }, [found, status]);

  const stop = useCallback(() => {
    setStoppedKey(key);
    setFound(null);
  }, [key]);

  const resume = useCallback(() => {
    setStoppedKey(null);
    setDeniedKey(null);
    setFound(null);
    setRunId((n) => n + 1);
  }, []);

  const confirm = useCallback(async () => {
    if (!found || !target) return;
    setConfirming(true);
    try {
      // Every rule runs again now: time window, accuracy, freshness (a card left open for more
      // than 120 seconds fails here), radius, duplicate.
      const outcome = await checkIn(target.schedule, weatherCode, {
        position: found.position,
        isAutoGps: true,
      });
      if (outcome && outcome.kind === "failure") {
        // The user asked to check in and it was rejected: look for a fresh position.
        setFound(null);
        setRunId((n) => n + 1);
      }
    } finally {
      setConfirming(false);
    }
  }, [found, target, weatherCode, checkIn]);

  const windowOpensAt = target ? new Date(target.start.getTime() - checkInWindow.before * 60_000) : null;

  return { status, confirming, windowOpensAt, target, stop, resume, decline: stop, confirm };
}
