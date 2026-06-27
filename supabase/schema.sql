-- FINOY — database schema (Phase 1, slice 1: competitions)
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Re-running is safe (IF NOT EXISTS / OR REPLACE).

create table if not exists public.competitions (
  slug                 text primary key,
  name                 text not null,
  organizer            text not null default '',
  venue                text not null default '',
  city                 text not null default '',
  region               text not null default 'Luzon',
  date                 date not null,
  registration_deadline date,
  entry_fee            integer not null default 0,
  level                text not null default 'Local',
  max_entries          integer not null default 0,
  entries              integer not null default 0,
  categories           jsonb not null default '[]'::jsonb,
  status               text not null default 'upcoming',
  poster               text not null default 'from-gold-deep via-ink to-ink',
  poster_image         text,
  ranking_counts       boolean not null default false,
  allow_judges         boolean not null default false,
  allow_team_members   boolean not null default true,
  live_url             text,
  judges               jsonb not null default '[]'::jsonb,
  judges_published     boolean not null default false,
  judging_started      boolean not null default false,
  sponsors             jsonb not null default '[]'::jsonb,
  created_at           timestamptz not null default now()
);

-- Sorted listings hit the date column.
create index if not exists competitions_date_idx on public.competitions (date);

-- Row Level Security: anyone can READ competitions (public site); WRITES happen
-- server-side with the service_role key (which bypasses RLS). Tighten with
-- organizer/admin policies once Supabase Auth is wired in.
alter table public.competitions enable row level security;

drop policy if exists "competitions readable by everyone" on public.competitions;
create policy "competitions readable by everyone"
  on public.competitions for select
  using (true);
