# BettaRank PH

**The official Philippine National Betta Competition Management & Ranking Platform.**

A premium, sports-federation–style web app that standardizes betta fish
competitions nationwide — registration, digital judging, benching, BEP point
tracking, fish passports, and national rankings, from local clubs to the Grand
Championship.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** with a custom gold/black federation theme
- Fonts: Sora (display), Inter (body), JetBrains Mono (numerics)

> ⚠️ This repo runs a Next.js version with breaking changes. Read the bundled
> guides in `node_modules/next/dist/docs/` before changing routing or data
> fetching. Notably, instant client navigations require exporting
> `unstable_instant` from a route (see `docs/.../instant-navigation.md`).

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing — hero, live stats, upcoming competitions, rankings, Hall of Fame |
| `/competitions` | Filterable competition calendar (level / region / status) |
| `/competitions/[slug]` | Competition detail with live results board & BEP table |
| `/rankings` | National standings — fish, breeders, teams, handlers |
| `/fish/[id]` | Lifetime fish passport — stats, history, achievements |
| `/bep` | BEP point engine explainer + interactive calculator |
| `/hall-of-fame` | Season champions + historical archive |
| `/register` | Online fish registration flow |
| `/login` · `/judges` · `/handlers` · `/about` | Auth & role landing pages |

## Architecture notes

- **`src/lib/data.ts`** is the single mock data layer — a deterministic stand-in
  for the eventual PostgreSQL-backed API. Swap these functions for real `fetch`
  / DB calls when the backend (Laravel 12 / NestJS) lands. All formatting is
  locale-fixed (UTC) to avoid server/client hydration drift.
- **`src/components/ui.tsx`** holds the shared design-system primitives
  (Container, Card, Button, badges, rank medals).
- Server Components render the data; small `"use client"` islands handle the
  interactive bits (filters, ranking tabs, BEP calculator, mobile nav).

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```
