import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ROLE_ICON, ROLE_LABEL, type AppRole } from "@/lib/roles";
import { Container, Card } from "@/components/ui";
import { AccountActions } from "./account-actions";

export const metadata: Metadata = {
  title: "My Account",
  description: "Your FINOY account — role, profile, and quick actions.",
};

type QuickLink = { href: string; label: string; icon: string };

// Role-specific shortcuts.
const QUICK: Record<AppRole, QuickLink[]> = {
  "super-admin": [
    { href: "/super-admin", label: "Super Admin Console", icon: "🛡️" },
    { href: "/admin", label: "Organizer Console", icon: "🏆" },
    { href: "/admin/new", label: "Create a Competition", icon: "➕" },
  ],
  organizer: [
    { href: "/admin", label: "Organizer Console", icon: "🏆" },
    { href: "/admin/new", label: "Create a Competition", icon: "➕" },
  ],
  handler: [
    { href: "/handlers/me", label: "Handler Dashboard", icon: "✋" },
    { href: "/track", label: "Track a Fish", icon: "🔎" },
  ],
  breeder: [
    { href: "/rankings", label: "Breeder Rankings", icon: "🧬" },
    { href: "/register", label: "Register a Fish", icon: "🐟" },
  ],
  player: [
    { href: "/players/me", label: "My Player Profile", icon: "👤" },
    { href: "/register", label: "Register a Fish", icon: "🐟" },
  ],
};

// Shown to everyone signed in.
const COMMON: QuickLink[] = [
  { href: "/players/me", label: "My Player Profile", icon: "👤" },
  { href: "/competitions", label: "Competitions", icon: "📅" },
  { href: "/rankings", label: "National Rankings", icon: "📊" },
  { href: "/track", label: "Track Fish", icon: "🔎" },
];

export default async function AccountPage() {
  const session = await getSession();
  if (!session.loggedIn || !session.role) {
    redirect("/login?next=/account");
  }
  const role = session.role;
  const initials = (session.email ?? "U").slice(0, 2).toUpperCase();

  // De-dupe role links + common links by href.
  const seen = new Set<string>();
  const links = [...QUICK[role], ...COMMON].filter((l) =>
    seen.has(l.href) ? false : (seen.add(l.href), true),
  );

  return (
    <Container className="py-12">
      {/* Profile header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 divider-gold" />
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-2xl">
              {ROLE_ICON[role]}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
                  {ROLE_LABEL[role]}
                </span>
                {session.demo && (
                  <span className="rounded-md border border-line bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-faint">
                    Demo session
                  </span>
                )}
              </div>
              <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
                My Account
              </h1>
              <p className="mt-0.5 text-sm text-muted">
                {session.demo ? (
                  <>
                    You&apos;re exploring as a{" "}
                    <span className="text-fg">{ROLE_LABEL[role]}</span> (demo —
                    no real account).
                  </>
                ) : (
                  <span className="font-mono">{session.email}</span>
                )}
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="flex size-12 items-center justify-center rounded-full border border-line bg-surface-2 font-display text-sm font-bold text-muted">
              {initials}
            </span>
          </div>
        </div>
        <div className="border-t border-line p-6 sm:px-8">
          <AccountActions demo={session.demo} />
        </div>
      </Card>

      {/* Quick actions */}
      <h2 className="mb-4 mt-10 font-display text-xl font-bold">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="flex items-center gap-3 p-5 transition-colors hover:border-line-strong">
              <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-xl">
                {l.icon}
              </span>
              <span className="font-semibold text-fg">{l.label}</span>
              <span className="ml-auto text-faint">→</span>
            </Card>
          </Link>
        ))}
      </div>

      {session.demo && (
        <p className="mt-8 text-sm text-faint">
          This is a demo session for testing roles. Once Supabase Auth is
          configured, accounts become real (email/password) and your profile
          links to your player/organizer records.
        </p>
      )}
    </Container>
  );
}
