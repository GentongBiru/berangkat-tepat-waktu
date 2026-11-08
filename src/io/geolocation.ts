import type { Position } from "../core/types";

// Thin wrappers over navigator.geolocation. Nothing here stores a position: callers
// get a Position, use it, and drop it. No location trail is ever kept.

export type GeoErrorKind = "permission_denied" | "unavailable" | "unsupported";

export class GeoError extends Error {
  readonly kind: GeoErrorKind;
  constructor(kind: GeoErrorKind) {
    super(kind);
    this.name = "GeoError";
    this.kind = kind;
  }
}

function getGeolocation(): Geolocation | null {
  // `?? null` also covers browsers or policies that expose the property as undefined.
  return (typeof navigator !== "undefined" ? navigator.geolocation : null) ?? null;
}

export const isGeolocationSupported = (): boolean => getGeolocation() !== null;

function toPosition(p: GeolocationPosition): Position {
  return {
    latitude: p.coords.latitude,
    longitude: p.coords.longitude,
    accuracy: p.coords.accuracy,
    timestamp: p.timestamp,
  };
}

function toGeoError(e: GeolocationPositionError): GeoError {
  // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
  return new GeoError(e.code === 1 ? "permission_denied" : "unavailable");
}

/** One reading, for one tap. Rejects with GeoError. */
export function getCurrentPosition(): Promise<Position> {
  const geo = getGeolocation();
  if (!geo) return Promise.reject(new GeoError("unsupported"));
  return new Promise<Position>((resolve, reject) => {
    geo.getCurrentPosition((p) => resolve(toPosition(p)), (e) => reject(toGeoError(e)), {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 0,
    });
  });
}

export const WATCH_MIN_INTERVAL_MS = 15_000;

/**
 * Low-frequency watch for opt-in Auto GPS. watchPosition has no frequency setting, so
 * updates closer than `minIntervalMs` are dropped, and high accuracy is not requested.
 * Returns a stop function that is safe to call more than once.
 */
export function watchPosition(
  onPosition: (position: Position) => void,
  onError: (error: GeoError) => void,
  minIntervalMs: number = WATCH_MIN_INTERVAL_MS,
): () => void {
  const geo = getGeolocation();
  if (!geo) {
    onError(new GeoError("unsupported"));
    return () => {};
  }

  let stopped = false;
  let lastDeliveredAt = 0;
  const watchId = geo.watchPosition(
    (p) => {
      if (stopped) return;
      const now = Date.now();
      if (lastDeliveredAt !== 0 && now - lastDeliveredAt < minIntervalMs) return;
      lastDeliveredAt = now;
      onPosition(toPosition(p));
    },
    (e) => {
      if (!stopped) onError(toGeoError(e));
    },
    { enableHighAccuracy: false, maximumAge: 30_000, timeout: 30_000 },
  );

  return () => {
    if (stopped) return;
    stopped = true;
    geo.clearWatch(watchId);
  };
}

/**
 * Notify when the geolocation permission changes (for example revoked in browser
 * settings), where the Permissions API exists. Returns an unsubscribe function.
 */
export function observePermission(onChange: (state: PermissionState) => void): () => void {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return () => {};
  let status: PermissionStatus | null = null;
  let cancelled = false;
  const handler = () => {
    if (status) onChange(status.state);
  };
  navigator.permissions
    .query({ name: "geolocation" })
    .then((s) => {
      if (cancelled) return;
      status = s;
      s.addEventListener("change", handler);
    })
    .catch(() => {});
  return () => {
    cancelled = true;
    status?.removeEventListener("change", handler);
  };
}
