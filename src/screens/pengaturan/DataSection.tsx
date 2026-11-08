import { useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { buildSampleData } from "../../fixtures/sample";
import { useAppState } from "../../state/AppStateProvider";
import { id as t } from "../../strings/id";

export function DataSection() {
  const { campus, actions } = useAppState();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [confirmingSample, setConfirmingSample] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const loadSample = () => {
    // Replaces schedules, check-ins, and pet. The user's own campus is kept when one exists.
    const sample = buildSampleData(new Date(), campus);
    const saved = actions.replaceData(
      { schedules: sample.schedules, checkIns: sample.checkIns, pet: sample.pet },
      campus ? undefined : sample.campus,
    );
    setConfirmingSample(false);
    setStatus(saved ? t.settings.sampleDone : null);
  };

  return (
    <section className="card" aria-labelledby="data-title">
      <h2 id="data-title">{t.settings.dataTitle}</h2>

      <p className="muted">{t.settings.sampleHint}</p>
      <button type="button" className="btn btn--secondary" onClick={() => setConfirmingSample(true)}>
        {t.settings.sampleButton}
      </button>
      <p role="status" className="status">
        {status}
      </p>

      <button type="button" className="btn btn--danger-outline" onClick={() => setConfirmingClear(true)}>
        {t.settings.clearButton}
      </button>

      <ConfirmDialog
        open={confirmingSample}
        title={t.settings.sampleTitle}
        message={t.settings.sampleMessage}
        confirmLabel={t.settings.sampleConfirm}
        onCancel={() => setConfirmingSample(false)}
        onConfirm={loadSample}
      />
      <ConfirmDialog
        open={confirmingClear}
        title={t.settings.clearTitle}
        message={t.settings.clearMessage}
        confirmLabel={t.settings.clearConfirm}
        danger
        onCancel={() => setConfirmingClear(false)}
        onConfirm={() => {
          actions.clearAllData();
          setConfirmingClear(false);
          setStatus(null);
        }}
      />
    </section>
  );
}
