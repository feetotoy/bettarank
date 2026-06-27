# Deploying FINOY (Netlify + Supabase)

This app is split into two independent layers:

| Layer | Service | Holds |
| ----- | ------- | ----- |
| **Frontend / SSR** | **Netlify** | The Next.js app — pages, server components, API routes. **Stateless.** |
| **Data / Auth / Storage** | **Supabase** | Postgres database, user accounts, uploaded files. **Stateful.** |

The most important consequence: **redeploying the Netlify site never touches Supabase data.** Code and data are decoupled — see [Updating the running system](#updating-the-running-system).

> Today the app still reads from the in-memory mock layer in `src/lib/data.ts`.
> Supabase is *wired and ready* (clients in `src/lib/supabase/`, env in
> `.env.example`) but not yet the data source. You can deploy and test the UI on
> Netlify now, then migrate `data.ts` to Supabase reads incrementally.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick a region close to PH (e.g. Singapore).
2. Set a strong database password (save it).
3. After it provisions, open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only — never expose)
4. **Project Settings → Database → Connection string** → `DATABASE_URL` (for migrations).

## 2. Run locally

```bash
cp .env.example .env.local      # then paste your Supabase values
npm install
npm run dev
```

Visit `http://localhost:3000/api/health` — it returns `{"status":"ok","supabaseConfigured":true}` once the env is set.

## 3. Deploy to Netlify

1. Put the repo on GitHub (`git init`, commit, push) — this enables **continuous deployment**.
2. On [netlify.com](https://netlify.com) → **Add new site → Import from Git** → pick the repo.
3. Netlify auto-detects Next.js (`netlify.toml` + the Next runtime are already configured). Leave the build command as `npm run build`.
4. **Site settings → Environment variables** → add the same keys from `.env.local`
   (set `NEXT_PUBLIC_SITE_URL` to the Netlify URL, e.g. `https://finoy.netlify.app`).
5. **Deploy.** When done, open `https://<your-site>.netlify.app/api/health` to confirm.

> The local `next build` failure you may see is environmental (offline Google
> Fonts). Netlify's build servers have internet, so the build succeeds there.

## 4. Custom domain (later)

When you're satisfied: **Netlify → Domain management → Add a domain**, then point your
DNS (an `ALIAS`/`ANAME`/`CNAME` to the Netlify target, or use Netlify DNS). Update
`NEXT_PUBLIC_SITE_URL` to the real domain and redeploy.

---

## Updating the running system

> *"How do I push changes without affecting the data already stored?"*

The golden rule: **code deploys and data live in different places.** You can ship
code as often as you like; data only changes when you deliberately run a migration.

### A. Code changes (UI, pages, logic) — always safe

1. Edit code → commit → push to your branch.
2. Netlify rebuilds and atomically swaps in the new version. **Zero data impact** — Supabase is untouched.
3. **Test before promoting:** open a Pull Request → Netlify publishes a **Deploy Preview** at a temporary URL. Verify there first, then merge to deploy to production.
4. **Rollback is instant:** Netlify → Deploys → pick a previous deploy → **Publish deploy**. (Again, data is untouched.)

### B. Database changes (new table/column) — additive & versioned

Schema changes are the *only* thing that can affect stored data, so they go
through **migrations**: small, numbered, forward-only SQL scripts checked into
the repo. Follow these rules and existing data is preserved:

1. **Always back up first.** Supabase keeps automatic daily backups (Pro), and you can take a manual snapshot before any migration.
2. **Only make additive changes** — add tables, add *nullable* columns, add indexes. New columns get a default or stay null for existing rows; nothing is overwritten.
3. **Never** drop/rename a column or change a type in the same release that ships the code using it. Use the **expand → migrate → contract** pattern:
   - **Expand:** add the new column (old code ignores it, old rows still valid).
   - **Migrate:** deploy code that writes to both old + new; backfill existing rows.
   - **Contract:** once everything uses the new column, a *later* migration drops the old one.
4. **Run migrations as their own step**, separate from the Netlify build — e.g. `npm run db:migrate` against `DATABASE_URL` from your machine or CI, not inside the page build. Each migration runs once and is recorded, so re-deploys don't re-run it.

```
# typical update loop once Supabase is the data source
git checkout -b feature/x
#  ... edit code; if schema changed, add a new migration file ...
npm run db:migrate         # apply the additive migration to Supabase (once)
git push                   # Netlify builds a Deploy Preview to test
#  ... merge PR → production deploy ...  (data already migrated, code now uses it)
```

### Why existing data is safe

- Netlify only ever replaces **build artifacts**; it has no access to your Postgres rows.
- Migrations are **additive and idempotent** — they extend the schema, they don't wipe it.
- Supabase persists independently of any deploy, with backups you can restore.

So: ship UI/logic freely and often; treat schema changes as deliberate, additive,
backed-up steps — and your live data stays intact across every update.
