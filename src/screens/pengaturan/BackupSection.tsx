import { useRef, useState, type ChangeEvent } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  backupFileName,
  buildBackup,
  deriveCampus,
  parseBackup,
  summarizeBackup,
  type BackupSummary,
} from "../../core/backup";
import type { BackupV1 } from "../../core/types";
import { downloadTextFile, readFileText } from "../../io/fileIO";
import { useAppState } from "../../state/AppStateProvider";
import { formatLongDate } from "../../strings/dates";
import { id as t } from "../../strings/id";

/**
 * Export and import of BackupV1 (no backend, no sync). Import is all-or-nothing and nothing is
 * written until the user confirms: pick -> read -> validate -> summary + warning -> confirm.
 */
type ImportState =
  | { step: "idle" }
  | { step: "reading" }
  | { step: "error"; lines: string[] }
  | { step: "confirm"; backup: BackupV1; summary: BackupSummary };

const errorLines = (kind: "too_large" | "unrecognised" | "invalid" | "read_failed"): string[] => {
  switch (kind) {
    case "unrecognised":
      return [t.backup.unrecognised, t.backup.unchanged];
    case "invalid":
      return [t.backup.invalid];
    case "too_large":
      return [t.backup.tooLarge];
    case "read_failed":
      return [t.backup.readFailed];
  }
};

export function BackupSection() {
  const { schedules, checkIns, pet, campus, actions } = useAppState();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ImportState>({ step: "idle" });
  const [status, setStatus] = useState<{ tone: "ok" | "warn"; lines: string[] } | null>(null);

  const onExport = () => {
    const now = new Date();
    const fileName = backupFileName(now);
    // The pet here carries the current derived streak, so the file holds today's value.
    const backup = buildBackup({ schedules, checkIns, pet }, now);
    downloadTextFile(fileName, JSON.stringify(backup, null, 2));
    setState({ step: "idle" });
    setStatus({ tone: "ok", lines: [t.backup.exported(fileName)] });
  };

  const onPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    // Reset so picking the same file again still fires a change event.
    input.value = "";
    if (!file) return;

    setStatus(null);
    setState({ step: "reading" });
    const read = await readFileText(file);
    if (!read.ok) {
      setState({ step: "error", lines: errorLines(read.error === "too_large" ? "too_large" : "read_failed") });
      return;
    }
    const parsed = parseBackup(read.text);
    if (!parsed.ok) {
      setState({ step: "error", lines: errorLines(parsed.error) });
      return;
    }
    // Nothing has been changed so far. Show what is in the file and wait for an explicit confirm.
    setState({ step: "confirm", backup: parsed.backup, summary: summarizeBackup(parsed.backup) });
  };

  const cancelImport = () => setState({ step: "idle" });

  const confirmImport = () => {
    if (state.step !== "confirm") return;
    const { backup, summary } = state;
    // Settings are not in the file. Only when this device has no campus yet, take one from the classes.
    const fallbackCampus = campus ? undefined : (deriveCampus(backup.schedules) ?? undefined);
    const saved = actions.replaceData(
      { schedules: backup.schedules, checkIns: backup.checkIns, pet: backup.pet },
      fallbackCampus,
    );
    setState({ step: "idle" });
    if (!saved) {
      setStatus({ tone: "warn", lines: [t.backup.saveFailed] });
      return;
    }
    const lines = [t.backup.imported(summary.classCount, summary.checkInCount, summary.totalXp)];
    if (fallbackCampus) lines.push(t.backup.campusFromFile);
    setStatus({ tone: "ok", lines });
  };

  const confirming = state.step === "confirm" ? state : null;
  const exportedAt = confirming ? new Date(confirming.backup.exportedAt) : null;

  return (
    <section className="card" aria-labelledby="backup-title">
      <h2 id="backup-title">{t.backup.title}</h2>
      <p className="muted">{t.backup.intro}</p>
      <p className="muted">{t.backup.included}</p>
      <p className="muted">{t.backup.notProof}</p>

      <div className="backup-actions">
        <button type="button" className="btn btn--secondary" onClick={onExport}>
          {t.backup.exportButton}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => inputRef.current?.click()}
          disabled={state.step === "reading"}
        >
          {state.step === "reading" ? t.backup.reading : t.backup.importButton}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(event) => void onPick(event)}
          data-testid="backup-file"
        />
      </div>

      {state.step === "error" && (
        <div className="notice backup-error" role="alert">
          {state.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
      {status && (
        <div className={status.tone === "ok" ? "status backup-status" : "notice backup-status"} role="status">
          {status.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirming !== null}
        title={t.backup.summaryTitle}
        message={t.backup.replaceWarning}
        confirmLabel={t.backup.confirm}
        danger
        onCancel={cancelImport}
        onConfirm={confirmImport}
      >
        {confirming && (
          <div className="backup-summary">
            <p>
              <strong>
                {t.backup.fileContains(
                  confirming.summary.classCount,
                  confirming.summary.checkInCount,
                  confirming.summary.totalXp,
                )}
              </strong>
            </p>
            {exportedAt && !Number.isNaN(exportedAt.getTime()) && (
              <p className="muted">{t.backup.exportedOn(formatLongDate(exportedAt))}</p>
            )}
            <p className="muted">{t.backup.currentData(schedules.length, checkIns.length, pet.totalXp)}</p>
          </div>
        )}
      </ConfirmDialog>
    </section>
  );
}
