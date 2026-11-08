import { useAppState } from "../../state/AppStateProvider";
import { id as t } from "../../strings/id";

export function DemoSection() {
  const { demoMode, actions } = useAppState();
  return (
    <section className="card" aria-labelledby="demo-title">
      <h2 id="demo-title">{t.settings.demoTitle}</h2>
      <label className="toggle">
        <input type="checkbox" checked={demoMode} onChange={(e) => actions.setDemoMode(e.target.checked)} />
        <span>{t.settings.demoToggle}</span>
      </label>
      <p className="muted">{t.settings.demoExplanation}</p>
    </section>
  );
}
