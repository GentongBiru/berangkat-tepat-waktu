import { useEffect, useState, type FormEvent } from "react";
import type { Campus } from "../../core/types";
import { DEFAULT_RADIUS_METRES, DEFAULT_TRAVEL_MINUTES } from "../../core/types";
import { validateCampus, type CampusFields, type CampusField, type FieldErrors } from "../../core/validation";
import { Field } from "../../components/Field";
import { useAppState } from "../../state/AppStateProvider";
import { GeoError, getCurrentPosition, isGeolocationSupported } from "../../io/geolocation";
import { id as t } from "../../strings/id";

function fieldsFrom(campus: Campus | null): CampusFields {
  return {
    name: campus?.name ?? "",
    latitude: campus ? String(campus.latitude) : "",
    longitude: campus ? String(campus.longitude) : "",
    radiusMetres: String(campus?.radiusMetres ?? DEFAULT_RADIUS_METRES),
    defaultTravelMinutes: String(campus?.defaultTravelMinutes ?? DEFAULT_TRAVEL_MINUTES),
  };
}

export function CampusSection() {
  const { campus, schedules, actions } = useAppState();
  const [fields, setFields] = useState<CampusFields>(() => fieldsFrom(campus));
  const [errors, setErrors] = useState<FieldErrors<CampusField>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Reset the form when the saved campus changes (save, or "hapus semua data").
  useEffect(() => {
    setFields(fieldsFrom(campus));
    setErrors({});
  }, [campus]);

  const set = (key: CampusField) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    setStatus(null);
  };

  const outOfSync = campus
    ? schedules.filter(
        (s) =>
          s.latitude !== campus.latitude ||
          s.longitude !== campus.longitude ||
          s.radiusMetres !== campus.radiusMetres ||
          s.campusName !== campus.name,
      )
    : [];

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = validateCampus(fields);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus(null);
      return;
    }
    setErrors({});
    const saved = actions.saveCampus(result.value);
    setStatus(saved.ok ? t.settings.saved : null);
  };

  const useMyLocation = async () => {
    setStatus(null);
    if (!isGeolocationSupported()) {
      setErrors((e) => ({ ...e, latitude: t.settings.locationUnsupported }));
      return;
    }
    setLocating(true);
    try {
      // One reading for this tap only. Nothing is stored except what the user saves.
      const position = await getCurrentPosition();
      setFields((f) => ({
        ...f,
        latitude: position.latitude.toFixed(6),
        longitude: position.longitude.toFixed(6),
      }));
      setErrors((e) => ({ ...e, latitude: undefined, longitude: undefined }));
    } catch (error) {
      const kind = error instanceof GeoError ? error.kind : "unavailable";
      const message =
        kind === "permission_denied"
          ? t.checkInErrors.permissionDenied
          : kind === "unsupported"
            ? t.settings.locationUnsupported
            : t.checkInErrors.positionUnavailable;
      setErrors((e) => ({ ...e, latitude: message }));
    } finally {
      setLocating(false);
    }
  };

  const applyToSchedules = () => {
    if (!campus) return;
    for (const s of outOfSync) {
      actions.saveSchedule({
        ...s,
        campusName: campus.name,
        latitude: campus.latitude,
        longitude: campus.longitude,
        radiusMetres: campus.radiusMetres,
      });
    }
    setStatus(t.settings.appliedToSchedules);
  };

  return (
    <section className="card" aria-labelledby="campus-title">
      <h2 id="campus-title">{t.settings.campusTitle}</h2>
      <p className="muted">{t.settings.campusHint}</p>
      <form onSubmit={onSubmit} noValidate>
        <Field label={t.settings.campusName} error={errors.name}>
          {(p) => (
            <input {...p} type="text" value={fields.name} onChange={(e) => set("name")(e.target.value)} autoComplete="off" />
          )}
        </Field>
        <Field label={t.settings.latitude} error={errors.latitude}>
          {(p) => (
            <input {...p} type="text" inputMode="decimal" value={fields.latitude} onChange={(e) => set("latitude")(e.target.value)} autoComplete="off" />
          )}
        </Field>
        <Field label={t.settings.longitude} error={errors.longitude}>
          {(p) => (
            <input {...p} type="text" inputMode="decimal" value={fields.longitude} onChange={(e) => set("longitude")(e.target.value)} autoComplete="off" />
          )}
        </Field>
        <button type="button" className="btn btn--secondary" onClick={useMyLocation} disabled={locating}>
          {locating ? t.settings.locating : t.settings.useMyLocation}
        </button>
        <Field label={t.settings.radius} error={errors.radiusMetres}>
          {(p) => (
            <input {...p} type="text" inputMode="numeric" value={fields.radiusMetres} onChange={(e) => set("radiusMetres")(e.target.value)} autoComplete="off" />
          )}
        </Field>
        <Field label={t.settings.defaultTravel} error={errors.defaultTravelMinutes}>
          {(p) => (
            <input {...p} type="text" inputMode="numeric" value={fields.defaultTravelMinutes} onChange={(e) => set("defaultTravelMinutes")(e.target.value)} autoComplete="off" />
          )}
        </Field>
        <button type="submit" className="btn btn--primary">
          {t.common.save}
        </button>
      </form>

      <p role="status" className="status">
        {status}
      </p>

      {outOfSync.length > 0 && (
        <div className="notice">
          <p>{t.settings.campusOutOfSync}</p>
          <button type="button" className="btn btn--secondary" onClick={applyToSchedules}>
            {t.settings.applyToSchedules(outOfSync.length)}
          </button>
        </div>
      )}
    </section>
  );
}
