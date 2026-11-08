# Berangkat Tepat Waktu (OnTime Pet)

A campus punctuality app for university students. Built for **Kiroween 2026**, category **Frankenstein**.

> Never be late for class again: your schedule, the weather, and a pet that only grows when you actually arrive on time.

**Live URL:** _to be added after the first deploy._

- [Ringkasan dalam Bahasa Indonesia](#ringkasan-dalam-bahasa-indonesia)
- [The problem](#the-problem)
- [The Frankenstein stitch](#the-frankenstein-stitch)
- [What it does](#what-it-does)
- [Honest limits and risks](#honest-limits-and-risks)
- [Privacy](#privacy)
- [How Kiro was used](#how-kiro-was-used)
- [Run, build, deploy](#run-build-deploy)
- [Project layout](#project-layout)
- [Testing status](#testing-status)
- [Licence](#licence)

All text inside the app is in Bahasa Indonesia. Code, comments and these docs are in English.

## Ringkasan dalam Bahasa Indonesia

Aplikasi untuk mahasiswa supaya tidak telat kuliah. Alurnya satu garis lurus: **jadwal kuliah** memberi tahu kapan kelas mulai, **cuaca** mengubah jam berangkat (hujan menambah 20 menit), **GPS** memeriksa apakah kamu sudah berada di area kampus, dan **XP serta pet** memberi alasan untuk mengulanginya besok.

- Satu ketukan "Saya sudah sampai" membaca lokasi satu kali, lalu memberi XP sesuai seberapa awal kamu tiba (50, 30, atau 20 XP; terlambat 0 XP).
- Pet berevolusi di 100, 300, 600, dan 1000 XP. Ada streak dan tiga lencana.
- GPS otomatis (opsional, mati secara bawaan) hanya berjalan saat halaman Beranda terbuka dan hanya dari 60 menit sebelum kelas sampai 15 menit setelah kelas dimulai. Check-in tidak pernah dicatat diam-diam: kamu tetap harus mengetuk konfirmasi.
- Semua data hanya tersimpan di browser kamu. Tidak ada akun, tidak ada server. Pindah HP lewat ekspor dan impor file JSON.
- **Ini alat motivasi, bukan sistem absensi.** GPS di browser bisa dipalsukan, dan satu keterbatasan yang sudah diketahui ada di bagian "Honest limits": menghapus sebuah kelas lalu menambahkannya lagi membuatnya dihitung sebagai kelas baru, sehingga check-in kedua di hari yang sama tidak diblokir.

## The problem

Students are often late because they underestimate travel time, ignore rain, and have no reason to leave early. Reminder apps only nag. They do not adjust for weather, and they do not reward punctuality.

## The Frankenstein stitch

Four parts are sewn into one loop, and each depends on the one before it:

1. **The schedule decides when.** You enter your classes once.
2. **The weather changes when you leave.** Departure time is `class start - travel time - weather buffer`. Drizzle, rain, showers or thunderstorm add 20 minutes (live data from Open-Meteo). If the weather cannot be loaded, the app falls back to your normal travel time and says so.
3. **GPS checks where you are.** A check-in only counts inside your campus radius, in a time window, with a reasonably accurate and fresh position.
4. **The pet rewards doing it again.** XP depends on how early you arrived, the pet grows, and a streak builds.

## What it does

Four screens, bottom navigation:

| Screen | What is on it |
| --- | --- |
| **Beranda** (Home) | Today's classes as a task list, the pet, a 7-day streak row, current weather, the recommended departure time, and the blue **Saya sudah sampai** button for the next class only. |
| **Pet Saya** | The pet at its stage, XP progress, streak, the stage ladder, and badges with the date they were earned. |
| **Riwayat** (History) | Statistics (on-time percentage this month, average arrival, longest streak, total XP) and every check-in, newest first. |
| **Pengaturan** (Settings) | Campus point and radius, class schedule, automatic GPS, Demo Mode, backup (export and import), sample data, and clear-all. |

**XP by earliness**

| Arrival | XP |
| --- | --- |
| 30 or more minutes early | 50 |
| 15 to 29 minutes early | 30 |
| 1 to 14 minutes early | 20 |
| Exactly on time (the start minute) | 20 |
| Late | 0 (streak resets) |

Extras: +10 XP for an on-time arrival in the rain, and +50 XP once when a streak reaches exactly 5 days. Badges: "Pagi Buta" (30+ minutes early), "Hujan Pemberani" (on time in the rain), "Streak 5 Hari".

**Pet stages** by total XP: Telur (0), Bayi (100), Remaja (300), Dewasa (600), Legenda (1000). All pet art is hand-made SVG in the code.

**Streak:** a day counts if at least one class that day was checked in early or on time. Days without classes do not break it. A late check-in, or a class day with no successful check-in, resets it. The streak is always derived from your schedule and history.

**Automatic GPS** (opt-in, off by default). It is not background tracking:

- It runs only while Beranda is open and the tab is visible, and only from 60 minutes before the class until 15 minutes after it starts. Outside that window no location is read.
- It never runs in Demo Mode.
- A visible indicator reads "GPS aktif, mencari posisi kampus" with a stop button.
- When it finds you inside the campus radius it stops watching and shows a confirm card. **Nothing is recorded until you tap confirm.** Every rule is checked again at that moment.

**Anti-cheat layers, honestly described.** Check-ins must be inside the time window (60 minutes before to 15 minutes after the start), have an accuracy of 100 m or better, use a position no older than 120 seconds, and be the first for that class that day. If two real check-ins imply travel faster than 200 km/h, the second one is kept and **flagged** "Perjalanan tidak wajar" (XP is not removed). These are cheap sanity checks, not proof.

**Demo Mode** simulates a position inside the campus so the whole flow can be shown indoors. Every Demo check-in is labelled **DEMO**, never described as GPS-checked, and still respects the time window. Real statistics exclude DEMO check-ins.

**Backup.** Export downloads `tepatwaktu-backup-v1-YYYY-MM-DD.json` (classes, check-ins, pet). Import validates the whole file, shows a summary and a replace warning, and changes nothing until you confirm. A bad file leaves your data untouched. Settings (campus point, automatic GPS, Demo Mode) are not in the file.

## Honest limits and risks

- **This is a motivation tool, not a fraud-proof attendance system.** XP and the pet cannot be exchanged for grades or money. The app does not check WiFi, does not detect mock-location apps, and has no server-side verification. It never claims to.
- **Browser GPS can be spoofed.** The checks above only raise the effort a little.
- **Delete-and-re-add is not blocked.** The "one check-in per class per day" rule is keyed by the class's id. If you delete a class and add it again it is a new class, so a second check-in the same day is allowed and awards XP again. Because you write your own schedule, you can also add an extra class at any time. This is a known limit and is disclosed in the app under Pengaturan, Tentang.
- **Accuracy.** Indoors and on large campuses GPS can be poor. The default radius is 300 m and you can change it.
- **Weather can fail.** Open-Meteo is free and keyless but not guaranteed. The app then uses your normal travel time.
- **Data lives in one browser on one device.** There is no account and no automatic sync. Moving to a new phone is a manual export and import. Clearing the browser's site data deletes your progress.
- **Automatic GPS only works while the page is open and visible.** A web page cannot track you in the background, and this one does not try.
- **After an import**, the streak is recomputed with the importing day's clock. It restores exactly on the same day and can legitimately be lower if you import days later.
- **Several tabs:** the app picks up changes made in another tab and does not overwrite them. There is no cross-tab lock, so two saves in the same few milliseconds are not covered.
- **Accessibility:** contrast, focus rings, names and keyboard use were checked with automated audits, but that is not full WCAG validation. That needs manual testing with assistive technology and expert review.

## Privacy

- No login, no accounts, no backend, no analytics. Everything is stored in your browser's `localStorage`.
- Your position is never stored, and there is no location trail. A check-in stores only the arrival time, minutes early or late, XP, the weather code, the position accuracy and flags.
- The only network request is the weather lookup to Open-Meteo, sent with the campus coordinates rounded to about 1 km.
- The deploy configs add a strict Content-Security-Policy that only allows that one outside host.

## How Kiro was used

Only what was actually used:

- **Spec-driven development.** The whole app was built from a spec in [`.kiro/specs/berangkat-tepat-waktu/`](.kiro/specs/berangkat-tepat-waktu/): `requirements.md` (acceptance criteria), `design.md` (architecture and decisions) and `tasks.md` (the ordered plan). Work was done one task at a time, each ending in a verification step, and the specs were updated whenever a decision changed.
- **Steering docs.** [`.kiro/steering/`](.kiro/steering/) holds `product.md` (the honesty rules and non-goals), `tech.md` (stack and conventions) and `structure.md` (folder layout). They were loaded as workspace rules in the later sessions.
- **A review checkpoint after every task.** The developer reviewed screenshots and test results and approved or redirected each step, for example choosing how to handle the delete-and-re-add limit and asking for the multi-tab data-loss fix before moving on.

## Run, build, deploy

Needs Node 20.19+ or 22.12+.

```bash
npm install
npm run dev        # development server
npm run typecheck  # tsc --noEmit
npm run build      # type-check, then production build into dist/
npm run preview    # serve dist/ locally
```

It is a static site: no server code, no environment variables, hash-based routing (`#/beranda`, `#/pet`, `#/riwayat`, `#/pengaturan`), so no rewrite rules are needed. The build uses relative asset paths, so it works at a domain root or under a sub-path.

The project is set up for Vercel: [`vercel.json`](vercel.json) holds the build command, the output folder (`dist/`), long-lived caching for the hashed assets, and the security headers. Because the output is plain static files, any static host can serve `dist/` too, but only the Vercel setup is configured and tested here.

## Project layout

```text
src/
  core/        pure logic: time, geo, departure, xp, streak, pet, badges, antiCheat, checkIn, backup, stats, tasks
  io/          browser adapters: storage, weatherClient, geolocation, fileIO
  state/       app state provider (keeps several tabs in sync)
  hooks/       useCheckIn, useAutoGps, useWeather, useNow, useRoute
  screens/     Beranda, PetSaya, Riwayat, Pengaturan
  components/  UI pieces and the SVG pets
  strings/     all Indonesian UI text
  fixtures/    opt-in sample data
.kiro/         specs and steering docs
```

`src/core` never touches browser APIs and takes time as an input, which is what made the rules easy to check.

## Testing status

- `npm run typecheck` and `npm run build` pass.
- There is **no automated test suite in this repository.** The app was exercised end to end in headless Microsoft Edge against the built site, at phone width, with a mocked clock and a mocked geolocation. That covered every acceptance scenario in the spec, automatic GPS, backup, multi-tab behaviour, and accessibility audits (contrast, names, focus rings, keyboard, reduced motion).
- **Not yet tested:** a real phone, real GPS (including how a locked phone behaves), Firefox and Safari. Those are the largest gap.

## Licence

[MIT](LICENSE).
