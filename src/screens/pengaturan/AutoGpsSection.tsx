import { useAppState } from "../../state/AppStateProvider";
import { id as t } from "../../strings/id";

/** Opt-in switch for automatic GPS. Default OFF. Nothing is read unless this is on. */
export function AutoGpsSection() {
  const { settings, demoMode, actions } = useAppState();
  return (
    <section className="card" aria-labelledby="autogps-title">
      <h2 id="autogps-title">{t.settings.autoGpsTitle}</h2>
      <label className="toggle">
        <input
          type="checkbox"
          checked={settings.autoGpsEnabled}
          onChange={(e) => actions.setSettings({ autoGpsEnabled: e.target.checked })}
        />
        <span>{t.settings.autoGpsToggle}</span>
      </label>
      <p className="muted">{t.autoGps.explanation}</p>
      <p className="muted">
        {t.settings.autoGpsWindow(settings.autoGpsWindowBeforeMin, settings.autoGpsWindowAfterMin)}
      </p>
      <p className="muted">{t.settings.autoGpsConfirm}</p>
      <p className="muted">{t.settings.autoGpsPermission}</p>
      {settings.autoGpsEnabled && demoMode && <p className="notice">{t.settings.autoGpsDemoNote}</p>}
    </section>
  );
}
