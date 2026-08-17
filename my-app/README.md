# Amaal Tracker

Roz ki panchon namazon ka hisaab rakhne wali web app — har namaz ke liye
Infiraadi / Jamaat / Qaza record karein.

Built with Next.js (App Router), TypeScript, Tailwind CSS. Data is stored
locally in `data/prayer-logs.json` via simple API routes (`src/app/api/prayers/route.ts`) —
no external database needed for this MVP.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Project structure

- `src/app/page.tsx` — main tracker UI
- `src/app/api/prayers/route.ts` — GET/POST endpoints for reading & saving a day's log
- `src/lib/store.ts` — JSON-file storage layer (swap for a real DB later)
- `src/lib/types.ts` — prayer names, statuses, and the DailyLog shape
- `src/components/PrayerCard.tsx` — one prayer's selector card
- `src/components/StarMotif.tsx` — decorative 8-pointed star motif

## Roadmap ideas

- History / calendar view of past days
- Login so multiple users can each have their own record
- Monthly stats (e.g. % Jamaat vs Qaza)
- Move storage from JSON file to a real database (Postgres/SQLite via a
  binary-free client) once deployed
