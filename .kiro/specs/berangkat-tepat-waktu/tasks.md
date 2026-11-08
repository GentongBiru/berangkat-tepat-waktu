# Implementation Plan: Berangkat Tepat Waktu

Tasks marked `*` are optional tests. Each task references requirements in `requirements.md`. Do not start until the spec is approved.

- [x] 1. Scaffold project and Kiro context
  - [x] 1.1 Create Vite + React + TypeScript project (strict mode), plain CSS, exact-pinned dependencies, MIT `LICENSE`
    - _Requirements: 14.2, 14.3, 15.3_
  - [x] 1.2 Add steering docs in `.kiro/steering/`: `product.md` (purpose, honesty rules, non-goals), `tech.md` (stack, commands), `structure.md` (folders from design.md)
    - _Requirements: 15.1_
  - [ ] 1.3 (hook file created; still needs to fire in a later session before it counts as used) Create a hook (via the hook tool) that runs `tsc --noEmit` after TypeScript file saves, and actually use it during development
    - _Requirements: 15.1_
  - [x] 1.4 Create `strings/id.ts` with the Indonesian strings from the spec and `styles/tokens.css` (blue primary, neutral, amber, rose, teal)
    - _Requirements: 14.1_

- [x] 2. Core types and pure logic
  - [x] 2.1 `types.ts` with Schedule, CheckIn, Pet, Settings, Campus, BackupV1
    - _Requirements: design Data Model_
  - [x] 2.2 `time.ts`: parse `HH:MM`, local start Date, `minutesEarly` with minute truncation, `windowState`
    - _Requirements: 5, 9.3, 10.2_
  - [x] 2.3 `geo.ts`: Haversine distance in metres
    - _Requirements: 5.2_
  - [x] 2.4 `weatherCodes.ts` and `departure.ts`: `isRain`, buffer (+20 / 0 / 0), departure time
    - _Requirements: 4.1–4.3_
  - [x] 2.5 `xp.ts`, `badges.ts`: XP table, rain bonus, streak bonus, badge rules
    - _Requirements: 6.1–6.3, 6.5_
  - [x] 2.6 `streak.ts`: derived streak, pending-today handling, skip no-class days
    - _Requirements: 6.4–6.6_
  - [x] 2.7 `pet.ts`: stage thresholds and progress
    - _Requirements: 6.7, 7.1_
  - [x] 2.8 `antiCheat.ts`: accuracy (>100), freshness (>120 s), impossible-travel (>200 km/h, campus points only, skip demo)
    - _Requirements: 10.1–10.7_
  - [x] 2.9 `checkIn.ts`: `decideCheckIn` pipeline (duplicate → window → accuracy → freshness → radius → flag), demo path
    - _Requirements: 5.3–5.9, 10, 11_
  - [x] 2.10 `stats.ts`: on-time % this month, average minutes early, longest streak, total XP
    - _Requirements: 8.2_
  - [ ]* 2.11 Unit tests for the correctness properties 1–6 in design.md (XP boundaries, stage boundaries, duplicate no-XP, accuracy/freshness boundaries, streak reset)
    - _Requirements: 6, 10_

- [x] 3. Backup export/import core
  - [x] 3.1 `backup.ts`: `buildBackup`, `parseBackup` with ordered validation, 2 MB cap, reject-whole-file, unique ids (no `scheduleId` reference check, so history of deleted classes stays importable), `summarizeBackup`, `backupFileName`
    - _Requirements: 12.1–12.4, 12.8_
  - [ ]* 3.2 Round-trip and corruption tests (wrong format, wrong version, bad field types, missing fields)
    - _Requirements: 12.9_

- [x] 4. I/O adapters and state
  - [x] 4.1 `storage.ts`: versioned keys, safe reads with fallback, single `commit`, `clearAll`, write-failure signal
    - _Requirements: 13, 14.5_
  - [x] 4.2 `weatherClient.ts`: Open-Meteo GET, 8 s timeout, shape check, null on any failure, 10-minute memory cache
    - _Requirements: 4.4, 4.5, 14.4_
  - [x] 4.3 `geolocation.ts`: promise wrapper for `getCurrentPosition` (error code mapping) and `watchPosition` wrapper returning a stop function
    - _Requirements: 5.1, 9.3_
  - [x] 4.4 `fileIO.ts`: Blob download with `tepatwaktu-backup-v1-YYYY-MM-DD.json` name, file reader
    - _Requirements: 12.1_
  - [x] 4.5 `AppStateProvider` with schedules, check-ins, pet, settings, campus, UI prefs; lazy streak recompute on load
    - _Requirements: 6.6, 14.5_
  - [x] 4.6 `useNow` and `useWeather` hooks (weather failure state = "unavailable")
    - _Requirements: 4.5_

- [x] 5. App shell and Pengaturan (needed to enter data first)
  - [x] 5.1 App shell with 4-item `BottomNav`, `aria-current`, focus handling
    - _Requirements: 3.6, 14.6_
  - [x] 5.2 Pengaturan: campus form with validation and "Pakai lokasi saya" (single read)
    - _Requirements: 2_
  - [x] 5.3 Pengaturan: schedule list and add/edit/delete form with validation and delete confirmation (deleting a class keeps its check-ins; Riwayat shows "Kelas dihapus")
    - _Requirements: 1_
  - [x] 5.4 Pengaturan: Demo Mode toggle (labelled) and persistent demo banner
    - _Requirements: 11.1, 11.4_
  - [x] 5.5 Pengaturan: "hapus semua data" with confirmation; "Tentang" honesty section
    - _Requirements: 10.8, 13_

- [x] 6. Beranda (Home)
  - [x] 6.1 `PetCompanion` (Telur 75/100 layout verified with the sample fixture) (verified with seeded data; the `fixtures/sample.ts` loader is still task 7.4) and `StreakWeek` seven-day row with original SVG glyph
    - _Requirements: 3.3, 3.7_
  - [x] 6.2 `TaskCard` list with states selesai / berikutnya / nanti / terlewat; next-class selection logic
    - _Requirements: 3.1, 3.2, 3.5_
  - [x] 6.3 Weather strip and departure display with fallback "Cuaca tidak tersedia, pakai waktu normal"; past-departure wording
    - _Requirements: 4, 3.2_
  - [x] 6.4 Blue "Saya sudah sampai" button on the next class only
    - _Requirements: 3.4_
  - [x] 6.5 `useCheckIn` wiring: single position read, error messages, transient failure message, no persistence on failure, Demo fallback offer
    - _Requirements: 5, 11_
  - [x] 6.6 `ResultCard` with arrival time, minutes early/late, XP, pet reaction, DEMO label; show existing result on duplicate tap
    - _Requirements: 3.8, 5.9, 11.3_
  - [x] 6.7 First-run empty states
    - _Requirements: 3.5_

- [x] 7. Pet, Riwayat
  - [x] 7.1 Hand-made SVG pets: Egg, Baby, Teen, Adult, Legend, with moods (built early, in task 6, because the companion needs every stage)
    - _Requirements: 6.8, 6.9_
  - [x] 7.2 Pet Saya screen: stage, XP, next-stage progress, streak, badges with derived dates
    - _Requirements: 7_
  - [x] 7.3 Riwayat screen: statistics (with the "Hanya kedatangan nyata, tidak termasuk DEMO." note and the demo-XP note on total XP), list, DEMO and "Perjalanan tidak wajar" chips, empty state
    - _Requirements: 8_
  - [x] 7.4 "Muat data contoh" action (Telur 75/100, streak 3) with replace warning
    - _Requirements: 7.3_

- [x] 8. Checkpoint: MVP
  - Run type-check and build; manually walk acceptance scenarios 1–10 from requirements.md; ask the user if questions arise.
  - First result: type-check and build passed; scenarios 1, 2, 3, 4, 5, 7, 8, 10 passed; 6 and 9 failed. After the decisions and fixes below, a full re-walk passed on both the development-mode build and the exact `npm run build` output:
    - [x] 8.1 Scenario 6, delete and re-add: DECISION A (accept and disclose). A deleted and re-added class has a new id, so a second check-in the same day is not blocked. No course-name field in BackupV1 and no format change. Disclosed in Pengaturan ? Tentang (done); the README must say it too (task 12.3).
    - [x] 8.2 Scenario 9: badges earned from a DEMO check-in are labelled "dari DEMO" and Pet Saya carries the same DEMO XP note as Riwayat (done).
    - [x] 8.3 Scenario 6, two tabs: fixed by task 12.5 (done before Task 9, as decided).

- [x] 9. v2: Anti-cheat in the UI
  - [x] 9.1 Wire time-window, accuracy, freshness messages into `useCheckIn` and show 0 XP outcome
    - _Requirements: 10.2–10.4_
  - [x] 9.2 Persist `flaggedSuspicious` and `accuracyMetres`; label in Riwayat
    - _Requirements: 8.4, 10.5_
  - [x] 9.3 Confirm no UI or doc text claims WiFi, mock-location, server-side, or cheat-proof verification (search the codebase)
    - _Requirements: 10.8_

- [x] 10. v2: Automatic GPS
  - [x] 10.1 Settings toggle (default OFF) with explanation text
    - _Requirements: 9.1_
  - [x] 10.2 `useAutoGps` state machine; low-frequency `watchPosition`; no reads when OFF, outside window, or in Demo Mode; cleanup on unmount
    - _Requirements: 9.2–9.5, 9.9, 11.5_
  - [x] 10.3 `AutoGpsIndicator` ("GPS aktif, mencari posisi kampus", stop button, `aria-live`)
    - _Requirements: 9.4_
  - [x] 10.4 `ConfirmArrivalCard`: stop watching on detect; record only after confirm; `isAutoGps = true`; re-run all rules at confirm time
    - _Requirements: 9.6–9.8_
  - [x] 10.5 Verify the last position is never stored
    - _Requirements: 9.10_
  - [ ]* 10.6 Test that `watchPosition` is never called when toggle OFF, window closed, or Demo ON (mocked geolocation) (not written as repo tests, as agreed; the same properties were checked in a real browser with a mocked geolocation, see the Task 10 report)
    - _Requirements: 9_

- [x] 11. v2: Export and import UI
  - [x] 11.1 Export button wired to `buildBackup` + download
    - _Requirements: 12.1_
  - [x] 11.2 Import modal flow: pick → validate → summary → replace warning → explicit confirm → commit; error and cancel leave data untouched
    - _Requirements: 12.2–12.8_
  - [x] 11.3 Manually test: export, clear data, import restores schedules, check-ins, XP, streak, pet; corrupt file rejects cleanly
    - _Requirements: 12.9_

- [ ] 12. Polish, accessibility, and deploy
  - [x] 12.1 Responsive mobile-first layout check, focus states, contrast, `prefers-reduced-motion`, ARIA labels (automated audit of the rendered DOM in about 20 UI states; it found and fixed the focus ring, control borders, and meaningful-icon contrast; automated only, not full WCAG validation)
    - _Requirements: 14.6_
  - [x] 12.2 Review whole app against all 13 acceptance scenarios; fix failures (full regression of scenarios 1-13, plus the new features, on the development-mode build and on the exact production build)
    - _Requirements: all_
  - [x] 12.3 README (English + Bahasa Indonesia summary): problem, Frankenstein stitch, honest risks, only Kiro features actually used. The README MUST also state the known limit from task 8.1: deleting a class and adding it again creates a new class id, so the one-check-in-per-class-per-day rule does not block a second check-in that day; XP is a motivation tool, not proof of attendance
    - _Requirements: 15.2_
  - [x] 12.4 Static deploy config for Vercel or Netlify; verify `npm run build` output works with no backend (Vercel only, by decision: vercel.json is the single deploy config and the Netlify file was removed; relative asset paths, CSP and security headers enforced and tested locally at the domain root and under a sub-path; not yet run on a real host)
    - _Requirements: 14.2_
  - [x] 12.5 Fix multi-tab data loss (reproduced in the task 8 walk: with two tabs open, any save in a stale tab, even toggling Demo Mode, wiped the other tab's check-in and XP, because each tab writes its whole state). Add a `storage` event listener in `AppStateProvider` that reloads state from storage when another tab changes it, and verify with two tabs in a browser
    - _Requirements: 14.5, 12.9_
  - [ ] 12.6 Open polish items from earlier checkpoints: test in Firefox, Safari, and on a real phone with real GPS (so far only Edge at 390px with mocked GPS). For automatic GPS in particular, a mocked geolocation cannot show how a real phone behaves: whether the permission prompt appears on the first watch, how often real `watchPosition` delivers fixes, whether a locked or backgrounded phone stops delivering them, and how accurate indoor fixes are near a campus edge
    - _Requirements: 14.6_

- [ ] 13. Final checkpoint (stays OPEN until the real-phone test is done and its findings are fixed)
  - Already done: type-check, build, final regression of all 13 acceptance scenarios on the development and production builds, temporary files removed. The agent commits, pushes, and deploys nothing; the developer does steps 13.1-13.3 and 13.5.
  - [ ] 13.1 Prepare the git repo and make the initial commit (developer runs the commands; check `git status` against the expected file list first)
  - [ ] 13.2 Create the PUBLIC GitHub repo (no README, licence, or .gitignore added by GitHub) and push `main`
  - [ ] 13.3 Import the repo into Vercel and deploy; open the live URL in a private window and check: loads over HTTPS without a Vercel login, the four screens work, the response headers include the Content-Security-Policy, the console shows no errors, and the weather loads
  - [ ] 13.4 Replace the placeholder "Live URL" in README.md with the real Vercel URL (agent edits once the URL is known), commit and push
  - [ ] 13.5 Real phone, real GPS (this is also the open task 12.6): test on the live URL, then report what happened
  - [ ] 13.6 Fix anything the phone test finds, re-verify, redeploy
  - [ ] 13.7 Only then close Task 13 and submit (public repo with MIT licence and `.kiro` committed, live URL, demo video, Devpost). Do not submit before this
