import type { Metadata } from "next";
import Link from "next/link";
import {
  formatDate,
  peso,
  platformFee,
  PLATFORM_FEE_LABEL,
} from "@/lib/data";
import { getCompetitions } from "@/lib/db/competitions";
import { Container, Card, LevelBadge, StatusBadge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Organizer Console",
  description:
    "Manage your sanctioned shows — entries, payments, benching, and rankings.",
};

export default async function AdminPage() {
  // Demo: treat the signed-in organizer as owner of these shows.
  const myShows = await getCompetitions();
  const totalEntries = myShows.reduce((sum, c) => sum + c.entries, 0);
  const live = myShows.filter((c) => c.status === "live").length;
  const revenue = myShows.reduce(
    (sum, c) => sum + Math.round(c.entries * 0.82) * c.entryFee,
    0,
  );
  const fee = platformFee(revenue);
  const net = revenue - fee;

  return (
    <Container className="py-12">
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/[0.06] px-4 py-2.5 text-sm text-gold">
        <span>🛡️</span>
        Signed in as <span className="font-semibold">Competition Organizer</span>
        — you have admin rights to the shows below.
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Organizer Console
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            My Shows
          </h1>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex h-11 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
        >
          + Create Competition
        </Link>
      </div>

      {/* Summary */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Shows managed", value: myShows.length.toString(), accent: false },
          { label: "Live now", value: live.toString(), accent: false },
          { label: "Total entries", value: totalEntries.toLocaleString(), accent: false },
          { label: "Gross revenue", value: peso(revenue), accent: false },
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
            <div className="mt-1 font-display text-2xl font-bold tabular-nums text-gold">
              {s.value}
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-xs text-faint">
        FINOY collects a {PLATFORM_FEE_LABEL} platform fee on gross show revenue.
        Across your shows that&apos;s {peso(fee)} — leaving a {peso(net)} net
        payout.
      </p>

      {/* Shows list */}
      <div className="mt-10 space-y-3">
        {myShows.map((comp) => {
          const fillPct = Math.round((comp.entries / comp.maxEntries) * 100);
          return (
            <Link
              key={comp.slug}
              href={`/admin/shows/${comp.slug}`}
              className="block"
            >
              <Card className="flex flex-col gap-4 p-5 transition-colors hover:border-line-strong sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <LevelBadge level={comp.level} />
                    <StatusBadge status={comp.status} />
                  </div>
                  <h2 className="truncate font-display text-lg font-bold text-fg">
                    {comp.name}
                  </h2>
                  <p className="truncate text-sm text-muted">
                    {comp.city} · {formatDate(comp.date)}
                  </p>
                </div>

                <div className="flex items-center gap-6 sm:shrink-0">
                  <div className="min-w-[120px]">
                    <div className="mb-1 flex justify-between text-xs text-faint">
                      <span>Entries</span>
                      <span className="tabular-nums">
                        {comp.entries}/{comp.maxEntries}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-bright"
                        style={{ width: `${Math.min(100, fillPct)}%` }}
                      />
                    </div>
                  </div>
                  <span className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-fg">
                    Manage →
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
