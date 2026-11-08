# Tech Stack

- Vite + React + TypeScript (strict), plain CSS only (no Tailwind). Static build, no backend.
- Dependencies are pinned to exact versions in `package.json`. No new runtime dependency without a reason.
- Dates: plain `Date`, local timezone, no date library.
- Pure logic in `src/core/` must not touch browser APIs; time is injected.

## Commands
- `npm install` install
- `npm run typecheck` type-check (`tsc --noEmit`)
- `npm run build` type-check then production build
- `npm run dev` dev server (run manually, do not start from the agent)

## Conventions
- Match existing style; keep functions small and typed.
- Every UI string goes through `src/strings/id.ts`.
- Icon-only controls need an ARIA label; no colour-only state.
