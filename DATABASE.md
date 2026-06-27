# Database (Phase 1) — Competitions slice

The app reads data through functions in `src/lib/`. The first slice converted
**competitions** to a real Supabase table, with an automatic **fallback to the
mock data** when Supabase isn't configured — so the app works either way.

| Without Supabase env vars | With Supabase env vars |
| --- | --- |
| Reads the in-memory mock (`src/lib/data.ts`). Pages look full. | Reads the `competitions` table (empty until you populate it). |

## Files in this slice
- `supabase/schema.sql` — the `competitions` table + RLS.
- `src/lib/supabase/admin.ts` — server-only service-role client + `isSupabaseConfigured()`.
- `src/lib/db/competitions.ts` — `getCompetitions()`, `getCompetitionBySlug()`, `createCompetition()` (DB when configured, else mock).
- `src/app/admin/new/actions.ts` — server action that **persists** a new show.
- `src/app/api/seed/route.ts` — `POST /api/seed` loads the sample shows (optional).

Wired to the DB layer: **/competitions** (list), **/competitions/[slug]** (detail),
**/admin** (organizer console), and the **Create Competition** form.
Still on mock (next slices): the homepage, rankings, and the per-show console
(`/admin/shows/[slug]`).

## Enable it (one-time)
1. Set the Supabase env vars (see `CONNECT.md`) — locally in `.env.local`, and in Netlify.
2. In **Supabase → SQL Editor → New query**, paste **`supabase/schema.sql`** and **Run**.
3. Restart `npm run dev` (or redeploy) so the env vars load. Check `/api/health` → `supabaseConfigured: true`.

## Test the empty → populate flow
1. **Start empty:** with the schema applied but the table empty, open **/competitions** and **/admin** — you'll see the empty states (no shows). This is the "no data yet" state.
2. **Populate via the UI:** go to **/admin/new**, fill in the form (name, organizer, region, dates, fee…), tick the terms, **Submit**. The server action inserts the row into Supabase and redirects you to **/admin**, where the new show now appears — and it's also on the public **/competitions** page (click into it).
3. **Confirm persistence:** refresh, or redeploy the site — the show is still there (it's in Postgres, not memory).
4. **(Optional) bulk sample data:** instead of hand-entering, run once:
   ```bash
   curl -X POST https://<your-site>/api/seed     # or http://localhost:3000/api/seed
   ```
   This upserts the sample competitions so you have realistic data immediately.
   (Delete or guard `/api/seed` before a real launch.)

## Extending to more tables (the pattern)
For each new entity (teams, accounts, entries, payments…):
1. Add its table to `supabase/schema.sql`.
2. Add `src/lib/db/<entity>.ts` with read/write functions that fall back to the mock.
3. Convert the relevant page reads to `await get…()`, and add a server action for writes.

Do it one entity at a time — the app keeps working throughout because every
function falls back to mock until its table exists and is populated.
