import type { Campus, Schedule } from "./types";
import { isValidHHMM } from "./time";
import { id as t } from "../strings/id";

// Form validation for Settings. Fields arrive as raw strings from inputs.
// Messages are Indonesian and come from strings/id.ts.

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

/** Parse a typed number. Accepts "-6,2" and "-6.2". Returns null when not a plain number. */
export function parseNumberInput(raw: string): number | null {
  const text = raw.trim().replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

// ---------- campus ----------

export interface CampusFields {
  name: string;
  latitude: string;
  longitude: string;
  radiusMetres: string;
  defaultTravelMinutes: string;
}

export type CampusField = keyof CampusFields;

export type CampusValidation =
  | { ok: true; value: Campus }
  | { ok: false; errors: FieldErrors<CampusField> };

export function validateCampus(fields: CampusFields): CampusValidation {
  const errors: FieldErrors<CampusField> = {};

  const name = fields.name.trim();
  if (name === "") errors.name = t.validation.required;

  const latitude = parseNumberInput(fields.latitude);
  if (fields.latitude.trim() === "") errors.latitude = t.validation.required;
  else if (latitude === null) errors.latitude = t.validation.invalidNumber;
  else if (latitude < -90 || latitude > 90) errors.latitude = t.validation.latitudeRange;

  const longitude = parseNumberInput(fields.longitude);
  if (fields.longitude.trim() === "") errors.longitude = t.validation.required;
  else if (longitude === null) errors.longitude = t.validation.invalidNumber;
  else if (longitude < -180 || longitude > 180) errors.longitude = t.validation.longitudeRange;

  const radius = parseNumberInput(fields.radiusMetres);
  if (fields.radiusMetres.trim() === "") errors.radiusMetres = t.validation.required;
  else if (radius === null) errors.radiusMetres = t.validation.invalidNumber;
  else if (radius <= 0) errors.radiusMetres = t.validation.radiusPositive;

  const travel = parseNumberInput(fields.defaultTravelMinutes);
  if (fields.defaultTravelMinutes.trim() === "") errors.defaultTravelMinutes = t.validation.required;
  else if (travel === null) errors.defaultTravelMinutes = t.validation.invalidNumber;
  else if (travel < 0) errors.defaultTravelMinutes = t.validation.travelNegative;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      latitude: latitude as number,
      longitude: longitude as number,
      radiusMetres: radius as number,
      defaultTravelMinutes: travel as number,
    },
  };
}

// ---------- schedule ----------

export interface ScheduleFields {
  courseName: string;
  dayOfWeek: string;
  startTime: string;
  campusName: string;
  travelMinutes: string;
}

export type ScheduleField = keyof ScheduleFields;

export type ScheduleValidation =
  | { ok: true; value: Schedule }
  | { ok: false; errors: FieldErrors<ScheduleField> };

/**
 * Build a Schedule from form fields. `base` supplies the campus point:
 * the current campus for a new class, or the class itself when editing.
 */
export function validateSchedule(
  fields: ScheduleFields,
  scheduleId: string,
  base: Pick<Schedule, "latitude" | "longitude" | "radiusMetres"> & { campusName: string },
): ScheduleValidation {
  const errors: FieldErrors<ScheduleField> = {};

  const courseName = fields.courseName.trim();
  if (courseName === "") errors.courseName = t.validation.required;

  const day = parseNumberInput(fields.dayOfWeek);
  if (day === null || !Number.isInteger(day) || day < 0 || day > 6) errors.dayOfWeek = t.validation.invalidDay;

  if (fields.startTime.trim() === "") errors.startTime = t.validation.required;
  else if (!isValidHHMM(fields.startTime.trim())) errors.startTime = t.validation.invalidTime;

  const travel = parseNumberInput(fields.travelMinutes);
  if (fields.travelMinutes.trim() === "") errors.travelMinutes = t.validation.required;
  else if (travel === null) errors.travelMinutes = t.validation.invalidNumber;
  else if (travel < 0) errors.travelMinutes = t.validation.travelNegative;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      id: scheduleId,
      courseName,
      dayOfWeek: day as number,
      startTime: fields.startTime.trim(),
      campusName: fields.campusName.trim() || base.campusName,
      latitude: base.latitude,
      longitude: base.longitude,
      radiusMetres: base.radiusMetres,
      travelMinutes: travel as number,
    },
  };
}
