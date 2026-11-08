import { CampusSection } from "./pengaturan/CampusSection";
import { ScheduleSection } from "./pengaturan/ScheduleSection";
import { AutoGpsSection } from "./pengaturan/AutoGpsSection";
import { BackupSection } from "./pengaturan/BackupSection";
import { DemoSection } from "./pengaturan/DemoSection";
import { DataSection } from "./pengaturan/DataSection";
import { AboutSection } from "./pengaturan/AboutSection";
import { id } from "../strings/id";

export function Pengaturan() {
  return (
    <section className="screen">
      <h1>{id.settings.title}</h1>
      <CampusSection />
      <ScheduleSection />
      <AutoGpsSection />
      <DemoSection />
      <BackupSection />
      <DataSection />
      <AboutSection />
    </section>
  );
}
