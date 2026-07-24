# QuickMove — Relocation Operations Tracker

A production-ready tool for QuickMove's ops team to track every relocation from kickoff to settled-in: a structured checklist per move, automatic escalation detection (blocked/stalled), and two AI features that turn the team's existing WhatsApp-style workflow into structured data instead of fighting it.

Built for the StampMyVisa "AI Ops Engineer" hiring assignment as the highest-leverage workflow identified in [the operations map](docs/the-map.md): structured status tracking + escalation detection, unlocked for adoption by AI parsing of the team's existing WhatsApp-style updates.

## What it does

- **Dashboard** — total/active/completed/blocked/stalled counts, open escalations feed
- **Relocation tracker** — per-move checklist across Housing → Moving → Utilities → Documentation → Settling In, with an animated origin→destination progress line
- **Escalation engine** — blocked items surface immediately; anything untouched for 3+ days is auto-flagged as stalled, both in the sidebar and on the relocation itself
- **AI WhatsApp parser** — paste a freeform update from an ops person, get back suggested checklist changes to review and approve (never auto-applied)
- **AI message drafter** — generate a warm, honest WhatsApp-style status update for the customer from the live checklist state
- **Works offline** — if the backend is unreachable, the app transparently falls back to localStorage so ops can keep working; a banner says so, and nothing is lost

## Stack

- **Frontend:** React + Vite, Tailwind CSS v4, Framer Motion, Lucide icons, React Router, React Hook Form, TanStack Query, Zustand
- **Backend:** Node.js + Express, REST API, Zod validation
- **Database:** SQLite via Prisma (schema is Postgres-portable — see below)
- **AI:** Claude API (`@anthropic-ai/sdk`), called server-side only

## Project structure

```
backend/     Express API, Prisma schema + seed, AI service, escalation logic
frontend/    Vite React app — components, hooks, zustand store, API client
```

## Running it locally

Two terminals — backend first, then frontend.

```bash
cd backend
npm install
cp .env.example .env      # fill in ANTHROPIC_API_KEY if you have one — optional
npm run db:migrate        # creates prisma/dev.db and applies the schema
npm run db:seed           # seeds 8 cities, 5 ops users, the default checklist template
npm run dev                # http://localhost:4000
```

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173 — proxies /api to :4000 in dev
```

Open http://localhost:5173. If you skip the `ANTHROPIC_API_KEY`, everything works except the two AI panels, which show a clear "AI features are not configured" message instead of failing silently.

## Environment variables

**backend/.env**
```
DATABASE_URL="file:./dev.db"
PORT=4000
ANTHROPIC_API_KEY=          # optional — AI parse/draft return 503 without it
```

**frontend/.env** *(optional for local dev — Vite's proxy handles it)*
```
VITE_API_BASE_URL=          # set only for production builds, e.g. https://your-api.up.railway.app/api
```

## Deployment

### Option A — one service, one URL (recommended)

The Express backend serves the built frontend directly (`backend/src/app.js` serves `frontend/dist` as static files with an SPA fallback, when that folder exists). One deploy, one platform, one link, no CORS/env-var juggling between two origins.

**Railway or Render**, root directory = **repo root** (not `backend/`):
- Build command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
- Start command: `cd backend && npm run db:deploy && npm run db:seed && npm start` (both are idempotent — safe on every restart)
- Add a persistent volume mounted at `backend/prisma` (Railway: Service → Volumes) so the SQLite file survives restarts/redeploys — without it, data resets on every deploy.
- Environment variables: `ANTHROPIC_API_KEY` (optional), `DATABASE_URL=file:./dev.db`. Leave `PORT` alone — the platform injects it and the app already reads `process.env.PORT`.
- Generate a public domain for the service — that URL is the one link to submit; it serves both the UI and the API.

### Option B — frontend and backend on separate platforms

Only worth it if you want the frontend on a CDN (Vercel) specifically.

- **Frontend → Vercel:** import `frontend/` as the project root, set `VITE_API_BASE_URL` to the deployed backend's URL + `/api`, deploy.
- **Backend → Railway or Render:** import `backend/` as the project root, same start command and volume as above minus the frontend build step.

### Postgres instead of SQLite

Either option works fine on SQLite + a volume at this scale (5 ops users, a few hundred relocations/month). To switch: change `provider = "sqlite"` to `provider = "postgresql"` in `backend/prisma/schema.prisma` and point `DATABASE_URL` at a Postgres instance (Neon/Supabase/Railway's own Postgres addon all work) — the schema uses no SQLite-only types, so no other changes are needed.

## Design notes

- **Checklist templates are per-city-capable, not hardcoded globally.** `ChecklistTemplateItem` rows with `cityId = null` are the default; city-specific override rows (e.g. a Bengaluru-only step) take precedence automatically — no code change needed to add one, just a data change. v1 ships only the default template for all 8 cities.
- **Every checklist edit is audited.** `ChecklistItemHistory` records old status → new status, who changed it, and whether it came from a manual edit or an AI-applied suggestion.
- **AI never writes directly.** Both AI features return suggestions; a human always clicks apply. The parser also retries once with a corrective prompt if Claude returns malformed JSON, and logs every attempt (`AiUpdateLog`) for debugging.
- **Escalations are a real table, not just a computed view** — so "how long was this blocked before someone noticed" is an actual queryable metric, not lost the moment the status changes.

## Known limitations / next steps

- Auth is intentionally minimal (ops-name selection, no passwords) — fine for 5 known internal users, not for a public deployment.
- The offline fallback keeps working locally but does not sync back once the backend returns — a device that went offline and created records will have local-only data until manually reconciled. Fine for the assignment's scope; a real v2 would need a sync/merge strategy.
- No automated test suite — verification was done via a manual pass through the golden path and the edge cases listed in the build plan (duplicate detection, same-city validation, past dates, malformed AI JSON, backend-down fallback, mobile layout).
