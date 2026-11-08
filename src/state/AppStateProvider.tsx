import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Campus, CheckIn, Pet, Schedule, Settings, WindowConfig } from "../core/types";
import { parseSchedule, type BackupState } from "../core/backup";
import { computeStreak } from "../core/streak";
import {
  clearAll as clearStorage,
  commit,
  defaultAppData,
  getLocalStorage,
  loadAll,
  parseCampus,
  readRaw,
  reloadChanged,
  type AppData,
  type RawSnapshot,
} from "../io/storage";
import { clearWeatherCache } from "../io/weatherClient";
import { useNow } from "../hooks/useNow";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** The freshest data, read from storage right now (other tabs included). */
export interface LatestState {
  schedules: Schedule[];
  checkIns: CheckIn[];
  /** Stored pet (its `streakDays` is only a cache). */
  pet: Pet;
  demoMode: boolean;
  window: WindowConfig;
}

export interface AppActions {
  /** Add or update a class (matched by id). */
  saveSchedule(schedule: Schedule): ActionResult;
  /** Delete a class ONLY. Its check-ins stay in history (Riwayat shows "Kelas dihapus"). */
  deleteSchedule(id: string): void;
  saveCampus(campus: Campus): ActionResult;
  setSettings(patch: Partial<Settings>): void;
  setDemoMode(enabled: boolean): void;
  /**
   * Read the freshest data. Use it right before deciding anything that depends on
   * history (a check-in), so a second open tab can never cause a stale decision.
   */
  readLatest(): LatestState;
  /**
   * Save a successful check-in and the updated pet. Returns false (and saves nothing)
   * when that class already has a check-in on that date.
   */
  recordCheckIn(checkIn: CheckIn, petAfter: Pet): boolean;
  /**
   * Import: replace schedules, check-ins, and pet. Settings, campus, and Demo Mode are
   * left as they are (except a campus passed in explicitly, used by the sample loader
   * when the user has none). Call only after validation and an explicit confirm.
   * Returns false when the browser could not save the new data.
   */
  replaceData(state: BackupState, campus?: Campus): boolean;
  /** Remove all app data from this browser and return to the first-run state. */
  clearAllData(): void;
}

export interface AppState {
  schedules: Schedule[];
  checkIns: CheckIn[];
  /** Pet with `streakDays` derived from the current schedule and history. */
  pet: Pet;
  settings: Settings;
  campus: Campus | null;
  demoMode: boolean;
  /** Check-in window (minutes before / after class start). */
  window: WindowConfig;
  /** Clock, refreshed every 30 seconds. */
  now: Date;
  /** false when the browser could not save data (quota, private mode). Show a banner. */
  storageOk: boolean;
  /** Keys that held unreadable data at startup and were reset to defaults. */
  loadIssues: string[];
  actions: AppActions;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => loadAll());
  const [data, setData] = useState<AppData>(initial.data);
  const [storageOk, setStorageOk] = useState(true);
  const dataRef = useRef<AppData>(initial.data);
  // What this tab last saw in storage, key by key. Used to spot changes made by other tabs.
  const rawRef = useRef<RawSnapshot | null>(initial.raw);
  const storageOkRef = useRef(true);
  const now = useNow();

  // Single write path: update memory, then storage, so the two cannot drift.
  const persist = useCallback((next: AppData): boolean => {
    dataRef.current = next;
    setData(next);
    const ok = commit(next);
    storageOkRef.current = ok;
    setStorageOk(ok);
    if (ok) rawRef.current = readRaw(getLocalStorage());
    return ok;
  }, []);

  /**
   * Pull in whatever another tab changed. Only changed keys are re-read, so unchanged
   * data keeps its identity (an open form is not reset). Skipped when this tab could not
   * save (memory-only mode), because then memory legitimately differs from storage.
   * Returns the freshest data.
   */
  const sync = useCallback((): AppData => {
    const seen = rawRef.current;
    if (storageOkRef.current && seen) {
      const result = reloadChanged(getLocalStorage(), dataRef.current, seen);
      if (result) {
        rawRef.current = result.raw;
        if (result.changed) {
          dataRef.current = result.data;
          setData(result.data);
        }
      }
    }
    return dataRef.current;
  }, []);

  // Another tab saved: pick it up now. Also re-sync when this tab comes back to the front or
  // is restored from the back/forward cache, because a hidden or frozen tab can miss events.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea && event.storageArea !== getLocalStorage()) return;
      sync();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    const onPageShow = () => {
      sync();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [sync]);

  const checkInWindow = useMemo<WindowConfig>(
    () => ({ before: data.settings.autoGpsWindowBeforeMin, after: data.settings.autoGpsWindowAfterMin }),
    [data.settings.autoGpsWindowBeforeMin, data.settings.autoGpsWindowAfterMin],
  );

  // The streak is derived. The stored value is only a cache for backup.
  const streak = useMemo(
    () => computeStreak(data.schedules, data.checkIns, now, checkInWindow),
    [data.schedules, data.checkIns, now, checkInWindow],
  );

  // Refresh the cached streak only when this tab's own derived value changes (and once at
  // load). Never because of a change that arrived from another tab: two tabs whose clocks
  // are a few seconds apart could otherwise rewrite each other's cache forever.
  const lastDerivedStreak = useRef<number | null>(null);
  useEffect(() => {
    if (lastDerivedStreak.current === streak) return;
    lastDerivedStreak.current = streak;
    const current = sync();
    if (current.pet.streakDays !== streak) {
      persist({ ...current, pet: { ...current.pet, streakDays: streak } });
    }
  }, [streak, persist, sync]);

  const actions = useMemo<AppActions>(
    () => ({
      saveSchedule(schedule) {
        const parsed = parseSchedule(schedule);
        if (typeof parsed === "string") return { ok: false, error: parsed };
        const cur = sync();
        const exists = cur.schedules.some((s) => s.id === parsed.id);
        const schedules = exists
          ? cur.schedules.map((s) => (s.id === parsed.id ? parsed : s))
          : [...cur.schedules, parsed];
        persist({ ...cur, schedules });
        return { ok: true };
      },

      deleteSchedule(id) {
        const cur = sync();
        // Check-ins are kept on purpose: history must survive deleting a class.
        persist({ ...cur, schedules: cur.schedules.filter((s) => s.id !== id) });
      },

      saveCampus(campus) {
        const parsed = parseCampus(campus);
        if (!parsed) return { ok: false, error: "campus" };
        persist({ ...sync(), campus: parsed });
        return { ok: true };
      },

      setSettings(patch) {
        const cur = sync();
        persist({ ...cur, settings: { ...cur.settings, ...patch } });
      },

      setDemoMode(enabled) {
        const cur = sync();
        persist({ ...cur, ui: { ...cur.ui, demoModeEnabled: enabled } });
      },

      readLatest() {
        const cur = sync();
        return {
          schedules: cur.schedules,
          checkIns: cur.checkIns,
          pet: cur.pet,
          demoMode: cur.ui.demoModeEnabled,
          window: { before: cur.settings.autoGpsWindowBeforeMin, after: cur.settings.autoGpsWindowAfterMin },
        };
      },

      recordCheckIn(checkIn, petAfter) {
        const cur = sync();
        const duplicate = cur.checkIns.some(
          (c) => c.scheduleId === checkIn.scheduleId && c.date === checkIn.date,
        );
        if (duplicate) return false;
        persist({ ...cur, checkIns: [...cur.checkIns, checkIn], pet: petAfter });
        return true;
      },

      replaceData(state, campus) {
        const cur = sync();
        return persist({
          ...cur,
          // Import leaves the campus alone. The sample loader passes one when none is set.
          campus: campus ?? cur.campus,
          schedules: [...state.schedules],
          checkIns: [...state.checkIns],
          pet: { ...state.pet, badges: [...state.pet.badges] },
        });
      },

      clearAllData() {
        const ok = clearStorage();
        clearWeatherCache();
        const fresh = defaultAppData();
        dataRef.current = fresh;
        setData(fresh);
        storageOkRef.current = ok;
        setStorageOk(ok);
        if (ok) rawRef.current = readRaw(getLocalStorage());
      },
    }),
    [persist, sync],
  );

  const value = useMemo<AppState>(
    () => ({
      schedules: data.schedules,
      checkIns: data.checkIns,
      pet: { ...data.pet, streakDays: streak },
      settings: data.settings,
      campus: data.campus,
      demoMode: data.ui.demoModeEnabled,
      window: checkInWindow,
      now,
      storageOk,
      loadIssues: initial.issues,
      actions,
    }),
    [data, streak, checkInWindow, now, storageOk, initial.issues, actions],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside <AppStateProvider>");
  return ctx;
}
