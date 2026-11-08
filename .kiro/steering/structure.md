# Project Structure

```
src/
  core/        pure logic: types, time, geo, departure, weatherCodes, xp, streak, pet, badges, antiCheat, checkIn, backup, stats
  io/          adapters: storage, weatherClient, geolocation, fileIO
  state/       AppStateProvider
  hooks/       useWeather, useCheckIn, useAutoGps, useNow
  screens/     Beranda, PetSaya, Riwayat, Pengaturan
  components/  BottomNav, TaskCard, PetCompanion, StreakWeek, ResultCard, AutoGpsIndicator, ConfirmArrivalCard, pets/*
  strings/id.ts  all Indonesian UI text
  styles/      tokens.css, base.css, per-screen CSS
.kiro/
  specs/berangkat-tepat-waktu/   requirements.md, design.md, tasks.md
  steering/                      product.md, tech.md, structure.md
  hooks/                         automation hooks
```

Dependency direction: screens → hooks → core; hooks → io. `core` never imports from `io`, `hooks`, or React.
