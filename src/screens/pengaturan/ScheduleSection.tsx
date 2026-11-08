import { useState, type FormEvent } from "react";
import type { Schedule } from "../../core/types";
import { validateSchedule, type FieldErrors, type ScheduleField, type ScheduleFields } from "../../core/validation";
import { Field } from "../../components/Field";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useAppState } from "../../state/AppStateProvider";
import { createId } from "../../io/ids";
import { id as t } from "../../strings/id";

// Monday first, Sunday last (display order only; stored values stay 0 = Sunday).
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
const dayRank = (day: number) => DAY_ORDER.indexOf(day as (typeof DAY_ORDER)[number]);

type Editing = { mode: "new" } | { mode: "edit"; schedule: Schedule };

export function ScheduleSection() {
  const { schedules, campus, actions } = useAppState();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Schedule | null>(null);
  const [addBlocked, setAddBlocked] = useState(false);

  const sorted = [...schedules].sort(
    (a, b) => dayRank(a.dayOfWeek) - dayRank(b.dayOfWeek) || a.startTime.localeCompare(b.startTime),
  );

  const startAdd = () => {
    if (!campus) {
      setAddBlocked(true);
      return;
    }
    setAddBlocked(false);
    setEditing({ mode: "new" });
  };

  return (
    <section className="card" aria-labelledby="schedule-title">
      <h2 id="schedule-title">{t.settings.scheduleTitle}</h2>

      {sorted.length === 0 ? (
        <p className="muted">{t.settings.scheduleEmpty}</p>
      ) : (
        <ul className="schedule-list">
          {sorted.map((s) => (
            <li key={s.id} className="schedule-item">
              <div>
                <p className="schedule-item__title">{s.courseName}</p>
                <p className="muted">
                  {t.days[s.dayOfWeek]} {s.startTime} · {s.campusName} · {t.settings.travelSummary(s.travelMinutes)}
                </p>
              </div>
              <div className="schedule-item__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  aria-label={t.settings.editAria(s.courseName)}
                  onClick={() => setEditing({ mode: "edit", schedule: s })}
                >
                  {t.common.edit}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  aria-label={t.settings.deleteAria(s.courseName)}
                  onClick={() => setPendingDelete(s)}
                >
                  {t.common.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <ScheduleForm
          key={editing.mode === "edit" ? editing.schedule.id : "new"}
          editing={editing}
          onDone={() => setEditing(null)}
        />
      ) : (
        <>
          <button type="button" className="btn btn--secondary" onClick={startAdd}>
            {t.settings.scheduleAdd}
          </button>
          {addBlocked && (
            <p role="alert" className="field__error">
              {t.validation.campusRequired}
            </p>
          )}
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete ? t.settings.deleteTitle(pendingDelete.courseName) : ""}
        message={t.settings.deleteMessage}
        confirmLabel={t.common.delete}
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) actions.deleteSchedule(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </section>
  );
}

function ScheduleForm({ editing, onDone }: { editing: Editing; onDone: () => void }) {
  const { campus, actions } = useAppState();
  const existing = editing.mode === "edit" ? editing.schedule : null;

  const [fields, setFields] = useState<ScheduleFields>({
    courseName: existing?.courseName ?? "",
    dayOfWeek: String(existing?.dayOfWeek ?? 1),
    startTime: existing?.startTime ?? "",
    campusName: existing?.campusName ?? campus?.name ?? "",
    travelMinutes: String(existing?.travelMinutes ?? campus?.defaultTravelMinutes ?? 30),
  });
  const [errors, setErrors] = useState<FieldErrors<ScheduleField>>({});

  const set = (key: ScheduleField) => (value: string) => setFields((f) => ({ ...f, [key]: value }));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    // New class: copy the campus point. Editing: keep the class's own point.
    const base = existing ?? (campus ? { ...campus, campusName: campus.name } : null);
    if (!base) {
      setErrors({ courseName: t.validation.campusRequired });
      return;
    }
    const result = validateSchedule(fields, existing?.id ?? createId(), base);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    const saved = actions.saveSchedule(result.value);
    if (saved.ok) onDone();
  };

  return (
    <form className="subform" onSubmit={onSubmit} noValidate aria-labelledby="schedule-form-title">
      <h3 id="schedule-form-title">{existing ? t.settings.scheduleEditTitle : t.settings.scheduleAddTitle}</h3>
      <Field label={t.settings.courseName} error={errors.courseName}>
        {(p) => (
          <input {...p} type="text" value={fields.courseName} onChange={(e) => set("courseName")(e.target.value)} autoComplete="off" />
        )}
      </Field>
      <Field label={t.settings.dayOfWeek} error={errors.dayOfWeek}>
        {(p) => (
          <select {...p} value={fields.dayOfWeek} onChange={(e) => set("dayOfWeek")(e.target.value)}>
            {DAY_ORDER.map((day) => (
              <option key={day} value={day}>
                {t.days[day]}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label={t.settings.startTime} error={errors.startTime}>
        {(p) => <input {...p} type="time" value={fields.startTime} onChange={(e) => set("startTime")(e.target.value)} />}
      </Field>
      <Field label={t.settings.scheduleCampusName} error={errors.campusName}>
        {(p) => (
          <input {...p} type="text" value={fields.campusName} onChange={(e) => set("campusName")(e.target.value)} autoComplete="off" />
        )}
      </Field>
      <Field label={t.settings.travelMinutes} error={errors.travelMinutes}>
        {(p) => (
          <input {...p} type="text" inputMode="numeric" value={fields.travelMinutes} onChange={(e) => set("travelMinutes")(e.target.value)} autoComplete="off" />
        )}
      </Field>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onDone}>
          {t.common.cancel}
        </button>
        <button type="submit" className="btn btn--primary">
          {t.common.save}
        </button>
      </div>
    </form>
  );
}
