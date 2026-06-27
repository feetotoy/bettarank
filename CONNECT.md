# Connecting FINOY to Supabase + Netlify

A step-by-step. Two services, decoupled: **Netlify** runs the Next.js app,
**Supabase** holds the database/auth/storage. "Connecting" them = putting the
Supabase keys into Netlify's environment variables.

> Note: the app currently runs on the in-memory mock data. Setting these keys
> makes Supabase *reachable* (health check turns green), but the app won't read
> real data until the `src/lib/data.ts` functions are migrated to Supabase
> (Phase 1). You can deploy and test the UI before doing that.

---

## Part 0 — Prerequisites
- The repo is on **GitHub** (it is — that's what your Actions run from).
- **Turn off the GitHub Pages deploy** that's failing: repo **Settings → Pages → Build and deployment → Source: None**, and delete any `.github/workflows/*.yml` that says "Deploy Next.js to Pages." Pages can't run this app — Netlify will.

## Part 1 — Create the Supabase project
1. Go to **supabase.com → New project**.
2. Name it (e.g. `finoy`), choose region **Southeast Asia (Singapore)**, set a strong **database password**, and **save that password**.
3. Wait ~2 min for it to provision.
4. Open **Project Settings → API** and copy these three values:
   - **Project URL** → for `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys → anon / public** → for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys → service_role** → for `SUPABASE_SERVICE_ROLE_KEY` *(secret — server only)*
5. Open **Project Settings → Database → Connection string → URI** and copy it → for `DATABASE_URL`. Replace `[YOUR-PASSWORD]` with the password from step 2. (Use the **Connection pooling** URI for the deployed app.)

## Part 2 — Deploy the app on Netlify
6. Go to **netlify.com** and **sign up / log in with GitHub**.
7. **Add new site → Import an existing project → Deploy with GitHub** → authorize → pick the FINOY repo.
8. Netlify auto-detects Next.js from `netlify.toml` (build command `npm run build`). Click **Deploy**.
9. First build runs (works on mock data, no Supabase needed yet). You get a URL like `https://finoy.netlify.app`.

## Part 3 — Connect Supabase to Netlify (env vars)
10. In your Netlify site → **Site configuration → Environment variables → Add a variable** (add each, scope = all):

    | Key | Value |
    | --- | ----- |
    | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon/public key |
    | `SUPABASE_SERVICE_ROLE_KEY` | your service_role key (secret) |
    | `DATABASE_URL` | your Postgres URI |
    | `NEXT_PUBLIC_SITE_URL` | `https://finoy.netlify.app` (your live URL) |

11. **Redeploy** so the new env vars take effect: **Deploys → Trigger deploy → Clear cache and deploy site**.
12. **Verify the connection:** open `https://<your-site>.netlify.app/api/health` → it should show `{"status":"ok","supabaseConfigured":true}`.

> Shortcut (optional): Netlify has a **Supabase extension** under
> *Integrations/Extensions* that can auto-inject `NEXT_PUBLIC_SUPABASE_URL` and
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` for you. The manual steps above always work.

## Part 4 — Run locally against the same Supabase
13. In the project root:
    ```bash
    cp .env.example .env.local      # paste the same 5 values
    npm install
    npm run dev                     # http://localhost:3000
    ```
14. Visit `http://localhost:3000/api/health` → `supabaseConfigured: true`.

## Part 5 — (Later) custom domain
15. Buy **finoy.pet**, then Netlify → **Domain management → Add a domain** → point DNS (use Netlify DNS, or an `ALIAS`/`CNAME` at your registrar). HTTPS is auto-issued.
16. Update `NEXT_PUBLIC_SITE_URL` to `https://finoy.pet` → redeploy.

## What "connected" means here
After Part 3, the credentials are wired and the Supabase clients in
`src/lib/supabase/` can reach your project — but the pages still render the mock
`data.ts`. The next phase is to **create the database schema and convert
`data.ts` to Supabase queries**, after which real data flows end-to-end.
Every code push to GitHub then auto-deploys on Netlify; your Supabase data is
untouched by deploys.
