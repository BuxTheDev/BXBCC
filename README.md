# BXB Command Center

Life OS + CRM. Origin-style structure (who am I, what am I working on, where, what matters and why → net worth, entities, assets, goals) with a Podio-style relational CRM (contacts, organizations, deals, pipelines, units, tasks) underneath. No funnels, no website builder, no email marketing.

Blueprint: the "BXB Command Center — Master CRM & Dashboard Blueprint" doc.

## Run it (demo mode, zero setup)

```bash
npm install
npm run dev        # http://localhost:3000
```

With no `.env.local` the app runs against an in-memory demo store seeded with your real entity/venture structure plus a few sample records. Edits work but vanish on restart.

## Connect the database (Phase 0)

1. Create a project at supabase.com (free tier is fine).
2. SQL editor → run `supabase/migrations/0001_schema.sql`, then `0002_seed.sql`.
3. Copy `.env.example` → `.env.local`, fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Project settings → API).
4. Restart `npm run dev`. Sidebar switches from "Demo mode" to "Connected".

Auth is not wired yet (single-user, RLS allows any authenticated user). Until Phase 2b adds Supabase Auth, keep the app on localhost or behind Vercel password protection — do not expose it publicly with the service role key.

## Deploy

Vercel → import repo → add the three env vars → deploy. `force-dynamic` is set on the root layout so every page reads live data.

## Layout

```
supabase/migrations/   schema + seed (the source of truth for the data model)
src/lib/types.ts       TS types mirroring the schema
src/lib/data.ts        readers (server-only) — demo or Supabase
src/lib/actions.ts     server actions (writes)
src/lib/demo.ts        in-memory demo store
src/app/               routes: / money ventures ventures/[slug] people people/[id] deals/[id] tasks
src/lib/ventures.ts    venture config — add a venture here, not in the schema
src/components/        ui kit, charts, life/*, crm/*
```

## Where this is in the build plan

| Phase | Status |
| --- | --- |
| 0 Schema | Done — `supabase/migrations` |
| 1 Life layer | Done — home, fronts, goals, entities, assets, money |
| 2 CRM core | Done — people, deals/kanban, deal & contact detail, tasks |
| 2b Redesign | Done — venture-first nav, 3-tab home, dark gradient UI |
| 3 Property ops | Partial — units + status; occupancies/bookings UI not built |
| 4 Money | Partial — manual transactions + class rollups; no Plaid |
| 5 Automation | Not started — rules engine, Salvo webhook (`/api/salvo` — deal.offer_fields is ready for it), SMS/email, digest |
| 6 Intelligence | Not started |

## Next up

- Supabase Auth (magic link) + middleware so the app can go public.
- `/api/salvo` webhook: accept Salvo's GHL-mapped CSV row shape, upsert contact + deal into `tl-acq` at "LOI sent".
- Occupancy CRUD on `/portfolio` (bookings, resident stays).
- pg_cron + Edge Function for the Monday digest and the alert rules already computed in `getAlerts()`.

## Redesigned BXB OS preview

Open `/os#/today` for the mobile-ready workspace. Original application routes are preserved. The six files in `public/os` form a standalone frontend with daily focus, weekly reviews, entity hierarchy, financial summaries, and local backup/recovery.

Records remain browser-local until cloud saving is configured. Existing local-host data does not move automatically to a deployment: export a backup from the original browser and preview/import it in Settings & recovery. Cloud connection settings are entered separately; no secrets or browser backups are included in this repository. The optional manual cloud save integration still needs its dedicated schema and live verification. It does not use the original Next.js application's service-role database connection.
