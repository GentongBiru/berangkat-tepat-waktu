# Product: Berangkat Tepat Waktu

Static web app for Indonesian university students (Kiroween 2026, Frankenstein category). The loop: schedule decides when, weather adjusts when to leave (+20 min if rain), GPS proves where, a pet rewards repeating it.

## Rules that always apply
- All user-facing text is Bahasa Indonesia, kept in `src/strings/id.ts`. Code, comments, and specs are English.
- No login, no backend, no database. Data lives in `localStorage` only. Only network call: Open-Meteo weather.
- This is a motivation tool, not a fraud-proof attendance system. Never claim or build: WiFi verification, mock-location detection, server-side verification, or "cheat-proof" / "verified attendance" wording.
- Never store user coordinates or a location trail. Store only arrival time, minutes early, XP, weather code, accuracy, flags.
- Never record a check-in silently. Auto GPS (opt-in, default OFF, only 60 min before to 15 min after class start, only while Beranda is open) always needs a confirm tap.
- New users start at 0 XP. The Telur 75/100 state is design reference and an opt-in "Muat data contoh" sample only.
- Demo Mode check-ins are always labelled DEMO and respect the check-in time window.
- Failed attempts (outside radius, GPS error, rejected by anti-cheat) award 0 XP and are never saved.
- Visual identity is original. Do not copy art, colours, or mascots from other apps.

## Source of truth
Spec: `.kiro/specs/berangkat-tepat-waktu/` (requirements.md, design.md, tasks.md).
