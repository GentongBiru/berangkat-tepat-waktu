import { id as t } from "../../strings/id";

/** Honest scope: a motivation tool, not proof of attendance. */
export function AboutSection() {
  return (
    <section className="card" aria-labelledby="about-title">
      <h2 id="about-title">{t.settings.aboutTitle}</h2>
      <p>{t.settings.aboutMotivation}</p>
      <p>{t.settings.aboutSpoof}</p>
      <p>{t.settings.aboutReAdd}</p>
      <p>{t.settings.aboutPrivacy}</p>
    </section>
  );
}
