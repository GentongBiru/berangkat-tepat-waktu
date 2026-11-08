# Requirements Document: Berangkat Tepat Waktu

## Introduction

Berangkat Tepat Waktu (OnTime Pet) is a static web app for university students in Indonesia, built for Kiroween 2026 in the **Frankenstein** category. It stitches four parts into one loop: a class schedule decides *when*, weather changes *when to leave*, GPS proves *where* the student is, and a pet rewards doing it again tomorrow.

The app is a **motivation tool, not a fraud-proof attendance system**. It has no login, no backend, and stores everything in `localStorage`. All user-facing text is in Bahasa Indonesia. Code, comments, and spec files are in English.

This document covers MVP (v1) and the v2 features: opt-in automatic GPS, JSON export/import (BackupV1), and honest anti-cheat layers.

## Glossary

- **App**: the Berangkat Tepat Waktu web app.
- **Schedule**: one recurring weekly class entry.
- **CheckIn**: one successful, recorded arrival for one class on one day.
- **Check-in window**: from 60 minutes before class start until 15 minutes after class start (defaults; stored in Settings).
- **Minutes early**: whole minutes from arrival to class start. Arrival time is truncated to the minute (seconds dropped) before comparing, so any arrival during the start minute is exactly 0 (on time).
- **Rain**: Open-Meteo `weather_code` in the drizzle, rain, showers, or thunderstorm groups (51–67, 80–82, 95–99).
- **Auto GPS**: opt-in `watchPosition` detection limited to the check-in window.
- **Demo Mode**: labelled simulation of a position inside the campus radius.
- **BackupV1**: the versioned JSON export format.
- **Stage**: pet stage derived from total XP.

## Out of Scope (must NOT be built or claimed)

- Login, accounts, backend, database server, server-side verification, automatic cloud sync.
- Friend leaderboards or social features.
- Live traffic or public transport routing.
- Continuous or background GPS tracking, or any stored location trail.
- Campus WiFi verification (browsers cannot read SSIDs).
- Mock-location detection (only native apps can do this well).
- Any claim that check-ins are "cheat-proof", "fraud-proof", or "verified attendance" for official academic use.
- Payments, ads, runtime AI-generated images, merging of backups from two devices.

## Requirements

### Requirement 1: Class schedule management

**User Story:** As a student, I want to add, edit, and delete my weekly classes, so that the app knows when I must leave.

#### Acceptance Criteria

1. THE App SHALL let the user create a Schedule with course name, day of week (0 = Sunday to 6 = Saturday), start time (`HH:MM`, 24-hour), campus name, and travel time in minutes.
2. WHEN the user saves a new Schedule, THE App SHALL copy campus latitude, longitude, and radius from the campus settings, with defaults of 300 metres radius and 30 minutes travel time.
3. THE App SHALL let the user edit and delete an existing Schedule, and SHALL ask for confirmation before deleting.
4. IF a required field is empty or invalid (bad time format, travel time not a non-negative number), THEN THE App SHALL show an Indonesian validation message and SHALL NOT save the Schedule.
5. THE App SHALL persist schedules in `localStorage`.

### Requirement 2: Campus location settings

**User Story:** As a student, I want to set my campus location once, so that check-in works for my campus and not a hard-coded one.

#### Acceptance Criteria

1. THE App SHALL let the user set campus name, latitude, longitude, radius in metres (default 300), and default travel time in minutes.
2. IF latitude is outside −90..90, longitude is outside −180..180, or radius is not a positive number, THEN THE App SHALL reject the value with an Indonesian message.
3. WHERE the browser supports geolocation, THE App SHALL offer a button to fill coordinates from the current position, reading location once per tap only.

### Requirement 3: Home screen (Beranda) with today's classes

**User Story:** As a student, I want to see today's classes, the weather, and when to leave, so that I know what to do today.

#### Acceptance Criteria

1. THE Home screen SHALL show today's date and today's classes sorted by start time.
2. THE Home screen SHALL highlight the next upcoming class (or the class whose check-in window is currently open) and show its start time, current weather condition and precipitation, travel time used, and recommended departure time.
3. THE Home screen SHALL show the pet companion with stage name and XP progress to the next stage, and the current streak with a seven-day row.
4. THE Home screen SHALL show the primary button "Saya sudah sampai" for the next class only. The button SHALL be blue.
5. IF there are no classes today, THEN THE Home screen SHALL show an empty state in Indonesian with a link to add a class.
6. THE App SHALL provide bottom navigation with exactly four items: Beranda, Pet Saya, Riwayat, Pengaturan.
7. THE Home screen SHALL follow a task-tracker structure (a list of today's tasks with done / next / upcoming states) with a companion and streak pattern inspired by habit-building apps, adapted for education. THE App SHALL NOT copy any third-party art, colours, mascots, or wordmarks.
8. WHEN a check-in exists for a class today, THE Home screen SHALL show a result card with arrival time, minutes early or late, XP earned, and pet reaction.

### Requirement 4: Departure time and weather buffer

**User Story:** As a student, I want the departure time to account for rain, so that I do not underestimate travel time.

#### Acceptance Criteria

1. THE App SHALL compute `departure = classStartTime − travelMinutes − weatherBufferMinutes`.
2. WHEN current weather is Rain, THE App SHALL set weatherBufferMinutes to 20.
3. WHEN current weather is not Rain, THE App SHALL set weatherBufferMinutes to 0.
4. THE App SHALL fetch weather from Open-Meteo (`/v1/forecast?latitude=…&longitude=…&current=weather_code,precipitation`) without an API key.
5. IF the weather request fails, times out, or returns unexpected data, THEN THE App SHALL use buffer 0, show "Cuaca tidak tersedia, pakai waktu normal", and SHALL NOT block the schedule or check-in.
6. WHEN the departure time has already passed for the next class, THE App SHALL say so in Indonesian instead of showing a past time as a future instruction.

### Requirement 5: One-tap GPS check-in

**User Story:** As a student, I want to tap one button on arrival, so that the app verifies I am at campus and records my arrival.

#### Acceptance Criteria

1. WHEN the user taps "Saya sudah sampai", THE App SHALL read location exactly once via `navigator.geolocation.getCurrentPosition`. THE App SHALL NOT read location at any other time except under Requirement 9.
2. THE App SHALL compute distance to the class campus point with the Haversine formula.
3. WHEN distance ≤ radiusMetres and all anti-cheat checks (Requirement 10) pass, THE App SHALL record a CheckIn and award XP per Requirement 6.
4. IF distance > radiusMetres, THEN THE App SHALL show "Kamu belum di dalam area kampus. Coba lagi saat sudah benar-benar sampai." and award 0 XP.
5. IF permission is denied, THEN THE App SHALL show "Izin lokasi ditolak. Aktifkan izin lokasi di browser lalu coba lagi." and award 0 XP.
6. IF position is unavailable or times out, THEN THE App SHALL show "Lokasi tidak bisa dibaca sekarang. Coba lagi sebentar." and award 0 XP.
7. A failed attempt SHALL be shown as a transient message only. THE App SHALL NOT store it as a CheckIn and SHALL NOT show it in the XP history.
8. THE App SHALL store only arrival time, minutes early/late, XP, weather code, accuracy, and flags. THE App SHALL NOT store latitude or longitude of the user.
9. WHEN a CheckIn already exists for the same class on the same day, THE App SHALL show the existing result and SHALL NOT award XP again. "Same class" means the same class id. Deleting a class and adding it again creates a new class, so that second check-in is not blocked; this known limit SHALL be disclosed in Pengaturan → Tentang and in the README.
10. IF geolocation is unavailable or blocked, THEN THE App SHALL offer Demo Mode as a labelled fallback and SHALL NOT report fake success.

### Requirement 6: XP, streak, badges, and pet stages

**User Story:** As a student, I want to earn XP and see my pet grow when I arrive early or on time, so that I have a reason to repeat the behaviour.

#### Acceptance Criteria

1. THE App SHALL award XP by minutes early: 30 or more = 50 XP; 15 to 29 = 30 XP; 1 to 14 = 20 XP; exactly 0 = 20 XP; negative (late) = 0 XP.
2. WHEN minutes early is 30 or more, THE App SHALL grant badge "Pagi Buta" on first occurrence.
3. WHEN it is raining at check-in and arrival is early or on time, THE App SHALL award +10 XP extra and grant badge "Hujan Pemberani" on first occurrence.
4. A day SHALL count toward the streak if at least one class that day has an early or on-time CheckIn.
5. WHEN the streak reaches 5 consecutive days, THE App SHALL award +50 XP once for that run and grant badge "Streak 5 Hari" on first occurrence.
6. WHEN a late CheckIn is recorded, or a day that had at least one class ends with no early/on-time CheckIn, THE App SHALL reset the streak to 0. Days with no classes SHALL NOT break the streak.
7. THE App SHALL derive the pet stage from total XP: 0–99 Telur, 100–299 Bayi, 300–599 Remaja, 600–999 Dewasa, 1000+ Legenda. The stage SHALL change at exactly 100, 300, 600, and 1000 XP.
8. THE App SHALL show a sad pet state after a late check-in.
9. THE App SHALL render pets as hand-made SVG in the codebase, with no fetched or runtime-generated images.

### Requirement 7: Pet Saya screen

**User Story:** As a student, I want to see my pet, XP, and badges, so that progress feels tangible.

#### Acceptance Criteria

1. THE Pet Saya screen SHALL show the stage SVG, total XP, stage name, XP needed for the next stage (or a max-stage message for Legenda), and current streak.
2. THE Pet Saya screen SHALL list earned badges with the date earned.
3. THE App SHALL start a brand-new user at 0 XP in the Telur stage. The design reference and test fixture "Telur 75/100 XP" SHALL be available as sample data and SHALL NOT be applied silently to a real user (see Open Question 1 in design.md).

### Requirement 8: History and statistics (Riwayat)

**User Story:** As a student, I want to see my history and punctuality, so that I know whether I am improving.

#### Acceptance Criteria

1. THE Riwayat screen SHALL list CheckIns newest first with date, course, arrival time, minutes early or late, XP earned, and weather at check-in.
2. THE Riwayat screen SHALL show on-time percentage this month, average minutes early, longest streak, and total XP. The on-time percentage and average minutes early SHALL count real (non-DEMO) arrivals only, and the screen SHALL say so. Total XP SHALL be the pet's total and SHALL say it includes DEMO XP. Longest streak SHALL be computed from completed days.
3. WHEN a CheckIn has `isDemo = true`, THE App SHALL label it "DEMO" in the list and the result card, and SHALL NOT describe it as GPS-verified.
4. WHEN a CheckIn has `flaggedSuspicious = true`, THE Riwayat screen SHALL label it "Perjalanan tidak wajar".
5. THE Riwayat screen SHALL show an empty state when no CheckIns exist.

### Requirement 9: Automatic GPS (v2, opt-in, window-limited)

**User Story:** As a student, I want the app to notice when I reach campus, so that I do not have to remember to tap, while still staying in control.

#### Acceptance Criteria

1. THE App SHALL provide an Auto GPS toggle in Settings, default OFF, with an explanation that it only runs inside the check-in window and only while Beranda is open.
2. WHILE the toggle is OFF, THE App SHALL perform no automatic location reading.
3. WHILE the toggle is ON, Beranda is open, and the current time is within the check-in window of a class that has no CheckIn today, THE App SHALL use `navigator.geolocation.watchPosition` at low frequency (no high-accuracy polling loop).
4. WHILE watching, THE Home screen SHALL show the visible indicator "GPS aktif, mencari posisi kampus" with a stop button.
5. OUTSIDE the check-in window, THE App SHALL perform no location reading even if the toggle is ON.
6. WHEN the user is detected inside the campus radius, THE App SHALL stop watching and show the card "Kamu sudah di area kampus, check-in sekarang?" with confirm and cancel actions.
7. THE App SHALL record a CheckIn ONLY after the user taps confirm. THE App SHALL NEVER record a check-in silently.
8. THE confirmed CheckIn SHALL set `isAutoGps = true` and follow the same XP, streak, anti-cheat, and one-per-class-per-day rules as manual check-in.
9. THE App SHALL stop watching on the first of: successful check-in, window closes, user taps stop, user leaves Beranda, or permission revoked.
10. THE App SHALL NOT claim or imply background tracking. THE App SHALL NOT store a location trail.

### Requirement 10: Anti-cheat layers (v2, honest)

**User Story:** As a student and as a judge, I want check-ins to pass cheap, honest sanity checks, so that progress is meaningful without pretending to be fraud-proof.

#### Acceptance Criteria

1. THE App SHALL check, in order: time window, accuracy, freshness, one-per-class-per-day, impossible-travel flag.
2. IF the check-in time is outside 60 minutes before to 15 minutes after class start, THEN THE App SHALL reject with a clear Indonesian message and award 0 XP.
3. IF `coords.accuracy` is greater than 100 metres, THEN THE App SHALL reject with "Akurasi lokasi terlalu rendah. Coba lagi di tempat yang sinyal GPS-nya lebih baik." and award 0 XP.
4. IF the position timestamp is older than 120 seconds at check-in, THEN THE App SHALL reject with "Data lokasi sudah kedaluwarsa. Coba lagi." and award 0 XP.
5. WHEN the previous successful GPS CheckIn and the new one imply a speed above 200 km/h, THE App SHALL still record the new CheckIn with `flaggedSuspicious = true`. THE App SHALL NOT remove XP for a flagged CheckIn.
6. THE impossible-travel calculation SHALL use only the campus points of the two classes (no stored user coordinates) and SHALL skip Demo CheckIns.
7. THE App SHALL keep Demo CheckIns separate from GPS CheckIns in all checks.
8. THE App SHALL NOT claim WiFi verification, mock-location detection, server-side verification, or cheat-proof attendance anywhere in UI, README, or docs. Its text SHALL describe itself as a motivation tool.
9. THE badge a DEMO CheckIn earns SHALL be labelled "dari DEMO" on Pet Saya, and Pet Saya SHALL carry the same note as Riwayat that total XP includes XP from DEMO.

### Requirement 11: Demo Mode

**User Story:** As a judge or a student indoors, I want to demonstrate the full flow without real GPS, so that the demo works anywhere.

#### Acceptance Criteria

1. THE App SHALL provide a Demo Mode toggle in Settings, default OFF, clearly labelled.
2. WHILE Demo Mode is ON, check-in SHALL simulate a position inside the campus radius.
3. THE App SHALL label every Demo CheckIn "DEMO" in the result card and Riwayat.
4. THE App SHALL show a persistent indicator while Demo Mode is ON.
5. WHILE Demo Mode is ON, Auto GPS SHALL NOT run.

### Requirement 12: Export and import (v2, BackupV1)

**User Story:** As a student changing phones, I want to export and import my data, so that progress survives without a backend.

#### Acceptance Criteria

1. WHEN the user taps Export Data, THE App SHALL download one JSON file named `tepatwaktu-backup-v1-YYYY-MM-DD.json` in BackupV1 format (`format`, `version`, `exportedAt`, `schedules`, `checkIns`, `pet`).
2. WHEN the user picks a file to import, THE App SHALL validate in order: (a) parses as JSON with `format === "tepatwaktu-backup"` and `version === 1`; (b) schedules, check-ins, and pet match the data model shapes, including types, ranges, and ISO/date formats.
3. IF step (a) fails, THEN THE App SHALL show "File backup tidak dikenali."
4. IF any entry is invalid, THEN THE App SHALL reject the whole file. Partial import SHALL NOT occur.
5. WHEN validation passes, THE App SHALL show a summary of the number of classes, check-ins, and total XP in the file.
6. THE App SHALL show "Impor akan mengganti data yang ada sekarang. Ekspor dulu data lama kalau masih dibutuhkan." and SHALL require an explicit confirm tap.
7. ONLY after confirm, THE App SHALL replace local data with the imported data (full replace, no merge).
8. IF import is rejected or cancelled, THEN existing local data SHALL remain unchanged.
9. A valid export imported into a fresh browser SHALL restore schedules, check-ins, XP, streak, badges, and pet exactly.
10. THE App SHALL NOT claim automatic cloud sync exists.
11. WHEN an import is confirmed on a device that has no campus set, THE App SHALL set the campus from the most common campus point among the imported classes, and SHALL say so. An existing campus, Auto GPS setting, and Demo Mode SHALL NOT be changed by an import.
12. IF the browser cannot save the imported data, THEN THE App SHALL say so, SHALL leave the previously stored data as it was, and SHALL NOT report a plain success.

### Requirement 13: Clear data

**User Story:** As a student, I want to wipe my local data, so that I control my privacy.

#### Acceptance Criteria

1. THE Pengaturan screen SHALL provide a "hapus semua data" action that requires an explicit confirmation.
2. WHEN confirmed, THE App SHALL remove all App keys from `localStorage` and return to the first-run state.

### Requirement 14: Language, privacy, and platform

**User Story:** As an Indonesian student, I want a private, simple, Indonesian-language app, so that I trust and understand it.

#### Acceptance Criteria

1. ALL user-facing text SHALL be in Bahasa Indonesia.
2. THE App SHALL be a static Vite + React + TypeScript build with no backend and no authentication, deployed on Vercel (plain static files, so the build itself does not depend on the host).
3. THE App SHALL use one styling approach only (plain CSS).
4. THE App SHALL make no network request other than Open-Meteo weather, and SHALL send no user location other than the campus coordinates used for the weather query.
5. IF `localStorage` data is missing, corrupt, or from an unknown version, THEN THE App SHALL fall back to a safe first-run state without crashing.
6. THE UI SHALL be mobile-first, keyboard-operable, and use sufficient colour contrast, visible focus states, text labels on icons, and ARIA labels on icon-only controls. (Full WCAG compliance requires manual testing with assistive technology and is not claimed.)
7. WHEN a second browser tab of the App changes stored data, THE App SHALL pick the change up and SHALL NOT overwrite it with stale data from its own memory, including when that tab missed the change event.

### Requirement 15: Kiro usage and repository

**User Story:** As a hackathon participant, I want honest evidence of Kiro usage, so that judging is fair.

#### Acceptance Criteria

1. THE repository SHALL contain this spec in `.kiro/specs/berangkat-tepat-waktu/`, steering docs (product, tech stack, structure) in `.kiro/steering/`, and at least one hook that is actually used.
2. THE README SHALL be in English with a Bahasa Indonesia summary, explain the problem and the Frankenstein stitch, state known risks, and describe only Kiro features that were actually used.
3. THE repository SHALL include an MIT licence.

## Acceptance Test Checklist (traceability)

| # | Scenario | Requirements |
| --- | --- | --- |
| 1 | Class 30 min from now shows as next class with departure time | 3, 4 |
| 2 | Weather failure shows fallback message and does not block check-in | 4.5 |
| 3 | In-radius check-in XP matches table (30+, 15–29, 1–14, on time) | 5, 6.1 |
| 4 | Outside radius: 0 XP and message | 5.4 |
| 5 | Permission denied: 0 XP and message | 5.5 |
| 6 | Second check-in same class/day gives no XP | 5.9 |
| 7 | Stage changes at exactly 100, 300, 600, 1000 XP | 6.7 |
| 8 | Streak increments on consecutive days, resets on late | 6.4–6.6 |
| 9 | Demo check-ins labelled DEMO everywhere | 8.3, 11 |
| 10 | Works as static site, no backend, no login | 14.2 |
| 11 | Auto GPS: nothing outside window or when OFF; indicator and confirm card inside | 9 |
| 12 | Export valid; import restores exactly; bad file leaves data untouched; warning and confirm | 12 |
| 13 | Time window, accuracy, freshness rejected; impossible travel flagged and labelled | 10 |
