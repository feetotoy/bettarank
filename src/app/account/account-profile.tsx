"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { SocialLinks } from "@/components/social-links";
import { AccountActions } from "./account-actions";
import { ROLE_ICON, ROLE_LABEL, type AppRole } from "@/lib/roles";
import type { Socials } from "@/lib/data";

export interface ShowLite {
  slug: string;
  name: string;
  city: string;
  date: string;
  status: string;
  entries: number;
}
export interface HandledLite {
  code: string;
  className: string;
  division: string;
  owner: string;
  status: string;
}

interface Profile {
  photo?: string;
  bio: string;
  socials: Socials;
}

// Each role's primary shortcuts (Super Admin keeps only its console).
const QUICK: Record<AppRole, { href: string; label: string; icon: string }[]> = {
  "super-admin": [
    { href: "/super-admin", label: "Super Admin Console", icon: "🛡️" },
  ],
  organizer: [
    { href: "/admin", label: "Organizer Console", icon: "🏆" },
    { href: "/admin/new", label: "Create a Competition", icon: "➕" },
  ],
  handler: [{ href: "/handlers/me", label: "Handler Dashboard", icon: "✋" }],
  breeder: [
    { href: "/register", label: "Register a Fish", icon: "🐟" },
    { href: "/rankings", label: "Breeder Rankings", icon: "🧬" },
  ],
  player: [
    { href: "/players/me", label: "My Player Profile", icon: "👤" },
    { href: "/register", label: "Register a Fish", icon: "🐟" },
  ],
};

export function AccountProfile({
  role,
  email,
  demo,
  shows,
  handled,
}: {
  role: AppRole;
  email: string | null;
  demo: boolean;
  shows: ShowLite[];
  handled: HandledLite[];
}) {
  const storageKey = `finoy-profile-${email ?? role}`;
  const [profile, setProfile] = useState<Profile>({ bio: "", socials: {} });
  const [draft, setDraft] = useState<Profile>({ bio: "", socials: {} });
  const [editing, setEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Profile>;
        // One-time hydration from localStorage (an external store). Loading
        // after mount keeps SSR and the first client render in sync.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfile({
          photo: p.photo,
          bio: p.bio ?? "",
          socials: p.socials ?? {},
        });
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  function startEdit() {
    setDraft(profile);
    setEditing(true);
  }
  function save() {
    setProfile(draft);
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
    setEditing(false);
  }
  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" &&
      setDraft((d) => ({ ...d, photo: reader.result as string }));
    reader.readAsDataURL(file);
  }

  const view = editing ? draft : profile;
  const initials = (email ?? ROLE_LABEL[role]).slice(0, 2).toUpperCase();

  return (
    <div className="space-y-8">
      {/* ---------- Profile header ---------- */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 divider-gold" />
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
          {/* Avatar */}
          <div className="relative size-20 shrink-0">
            <button
              type="button"
              onClick={() => editing && fileRef.current?.click()}
              className={`group relative block size-full overflow-hidden rounded-2xl border border-gold/30 bg-gold/10 ${
                editing ? "cursor-pointer" : "cursor-default"
              }`}
            >
              {view.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={view.photo}
                  alt="profile"
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center font-display text-2xl font-bold text-gold">
                  {initials}
                </span>
              )}
              {editing && (
                <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-gold">
                  📷 Change
                </span>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPhoto}
              className="hidden"
            />
          </div>

          {/* Identity + bio */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
                {ROLE_ICON[role]} {ROLE_LABEL[role]}
              </span>
              {demo && (
                <span className="rounded-md border border-line bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-faint">
                  Demo session
                </span>
              )}
            </div>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
              My Account
            </h1>
            {!demo && email && (
              <p className="mt-0.5 font-mono text-sm text-muted">{email}</p>
            )}

            {/* Bio */}
            {editing ? (
              <textarea
                value={draft.bio}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, bio: e.target.value }))
                }
                rows={3}
                maxLength={280}
                placeholder="Add a short bio — your story, your bloodlines, your goals…"
                className="mt-4 w-full resize-none rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-fg outline-none focus:border-gold/60"
              />
            ) : view.bio ? (
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                {view.bio}
              </p>
            ) : (
              <p className="mt-3 text-sm text-faint">No bio yet.</p>
            )}

            {/* Socials */}
            {editing ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {(["facebook", "tiktok", "instagram"] as const).map((k) => (
                  <input
                    key={k}
                    value={draft.socials[k] ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        socials: { ...d.socials, [k]: e.target.value },
                      }))
                    }
                    placeholder={`${k} URL`}
                    className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs text-fg outline-none focus:border-gold/60"
                  />
                ))}
              </div>
            ) : (
              <SocialLinks socials={view.socials} size="sm" className="mt-4" />
            )}
          </div>
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-3 border-t border-line p-6 sm:px-8">
          {editing ? (
            <>
              <button
                type="button"
                onClick={save}
                className="inline-flex h-10 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-5 text-sm font-semibold text-ink"
              >
                Save profile
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-fg"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-fg transition-colors hover:border-gold/50"
            >
              ✎ Edit profile
            </button>
          )}
          <div className="ml-auto">
            <AccountActions demo={demo} />
          </div>
        </div>
      </Card>

      {/* ---------- Quick actions ---------- */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK[role].map((l) => (
            <Link key={l.href} href={l.href}>
              <Card className="flex items-center gap-3 p-5 transition-all hover:-translate-y-0.5 hover:border-gold/40">
                <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-xl">
                  {l.icon}
                </span>
                <span className="font-semibold text-fg">{l.label}</span>
                <span className="ml-auto text-faint transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Organizer: my shows ---------- */}
      {role === "organizer" && <OrganizerShows shows={shows} />}

      {/* ---------- Handler: codes I'm handling ---------- */}
      {role === "handler" && <HandlerCodes handled={handled} />}

      {demo && (
        <p className="text-sm text-faint">
          Demo session — your photo, bio &amp; links are saved on this device for
          testing. With real accounts they save to your FINOY profile.
        </p>
      )}
    </div>
  );
}

function OrganizerShows({ shows }: { shows: ShowLite[] }) {
  const organizing = shows.filter((s) => s.status !== "completed");
  const organized = shows.filter((s) => s.status === "completed");
  return (
    <section>
      <h2 className="mb-1 font-display text-xl font-bold">My shows</h2>
      <p className="mb-4 text-sm text-muted">
        Shows you&apos;re organizing and ones you&apos;ve run.
      </p>
      <ShowGroup title="Organizing" items={organizing} />
      <ShowGroup title="Organized" items={organized} />
      {shows.length === 0 && (
        <Card className="p-6 text-sm text-faint">
          You haven&apos;t created any shows yet.
        </Card>
      )}
    </section>
  );
}

function ShowGroup({ title, items }: { title: string; items: ShowLite[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        {title}
      </div>
      <Card className="overflow-hidden">
        {items.map((s) => (
          <Link
            key={s.slug}
            href={`/admin/shows/${s.slug}`}
            className="flex items-center gap-3 border-b border-line/50 px-5 py-3.5 transition-colors last:border-0 hover:bg-surface-2"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-fg">{s.name}</div>
              <div className="truncate text-xs text-muted">
                {s.city} · {s.date} · {s.entries.toLocaleString()} entries
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-muted">
              {s.status}
            </span>
            <span className="text-faint">→</span>
          </Link>
        ))}
      </Card>
    </div>
  );
}

function HandlerCodes({ handled }: { handled: HandledLite[] }) {
  return (
    <section>
      <h2 className="mb-1 font-display text-xl font-bold">Codes I&apos;m handling</h2>
      <p className="mb-4 text-sm text-muted">
        Every fish you&apos;re benching, with its code &amp; current status.
      </p>
      <Card className="overflow-hidden">
        {handled.map((h) => (
          <div
            key={h.code}
            className="flex items-center gap-3 border-b border-line/50 px-5 py-3.5 last:border-0"
          >
            <span className="w-24 shrink-0 font-mono text-sm font-bold text-gold">
              {h.code}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-fg">
                {h.className}{" "}
                <span className="text-xs font-normal text-faint">
                  ({h.division})
                </span>
              </div>
              <div className="truncate text-xs text-muted">{h.owner}</div>
            </div>
            <span className="shrink-0 rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">
              {h.status}
            </span>
          </div>
        ))}
        {handled.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-faint">
            No fish assigned to you yet.
          </div>
        )}
      </Card>
    </section>
  );
}
