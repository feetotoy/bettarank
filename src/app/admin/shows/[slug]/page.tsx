import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  competitions,
  getCompetition,
  formatDate,
  peso,
  platformFee,
  PLATFORM_FEE_LABEL,
  fishRankings,
  registeredHandlers,
} from "@/lib/data";
import { Container, Card, Button, LevelBadge, StatusBadge } from "@/components/ui";
import { ShowManager, type RosterFish } from "./show-manager";

export function generateStaticParams() {
  return competitions.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comp = getCompetition(slug);
  return { title: comp ? `Manage · ${comp.name}` : "Manage show" };
}

export default async function ManageShowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comp = getCompetition(slug);
  if (!comp) notFound();

  const approved = Math.round(comp.entries * 0.82);
  const pending = comp.entries - approved;

  // Show finances: revenue from approved entries, FINOY's 5% platform fee, and
  // the organizer's net payout after the fee.
  const revenue = approved * comp.entryFee;
  const fee = platformFee(revenue);
  const net = revenue - fee;

  // Mock benched roster for the QR tool — fish whose category is in this show.
  const roster: RosterFish[] = fishRankings
    .filter((f) => comp.categories.includes(f.category))
    .map((f) => ({
      id: f.id,
      name: f.name,
      owner: f.owner,
      category: f.category,
    }));

  return (
    <Container className="py-10">
      {/* Console banner */}
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/[0.06] px-4 py-2.5 text-sm text-gold">
        <span>🛡️</span>
        Organizer Console — you have admin rights to this show
      </div>

      <Button href="/admin" variant="ghost" className="mb-4 px-0">
        ← All my shows
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <LevelBadge level={comp.level} />
            <StatusBadge status={comp.status} />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {comp.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {comp.venue} · {comp.city} · {formatDate(comp.date)}
          </p>
        </div>
        <Button href={`/competitions/${comp.slug}`} variant="outline">
          View public page ↗
        </Button>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Total entries", value: comp.entries.toLocaleString(), accent: false },
          { label: "Approved", value: approved.toLocaleString(), accent: false },
          { label: "Pending payment", value: pending.toLocaleString(), accent: false },
          { label: "Revenue", value: peso(revenue), accent: false },
          { label: `FINOY fee (${PLATFORM_FEE_LABEL})`, value: peso(fee), accent: true },
          { label: "Net payout", value: peso(net), accent: false },
        ].map((s) => (
          <Card
            key={s.label}
            className={`p-5 ${s.accent ? "border-gold/40 bg-gold/[0.05]" : ""}`}
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
              {s.label}
            </div>
            <div
              className={`mt-1 font-display text-2xl font-bold tabular-nums ${
                s.accent ? "text-gold" : "text-fg"
              }`}
            >
              {s.value}
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-xs text-faint">
        FINOY collects a {PLATFORM_FEE_LABEL} platform fee on show revenue
        ({peso(comp.entryFee)} × {approved.toLocaleString()} approved entries ={" "}
        {peso(revenue)}). Your net payout after the fee is {peso(net)}.
      </p>

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        {[
          { icon: "💳", label: "Approve payments" },
          { icon: "🏷️", label: "Print labels" },
          { icon: "📲", label: "Bench check-in" },
          { icon: "📣", label: "Publish announcement" },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-gold/50 hover:text-fg"
          >
            <span>{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

      {/* Show management — scoring, divisions, awards, QR tools */}
      <div className="mt-12">
        <h2 className="font-display text-xl font-bold">Show Management</h2>
        <p className="mt-1 text-sm text-muted">
          Score entries, build divisions &amp; classes, create awards, and
          reclass or rank fish by scanning their QR code.
        </p>
        <div className="mt-6">
          <ShowManager
            slug={comp.slug}
            showName={comp.name}
            showDate={formatDate(comp.date)}
            status={comp.status}
            liveUrl={comp.liveUrl}
            judges={comp.judges}
            judgesPublished={comp.judgesPublished}
            judgingStarted={comp.judgingStarted}
            sponsors={comp.sponsors}
            roster={roster}
            handlers={registeredHandlers}
          />
        </div>
      </div>
    </Container>
  );
}
