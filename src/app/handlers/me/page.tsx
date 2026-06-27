import type { Metadata } from "next";
import Link from "next/link";
import {
  currentHandler,
  handlerEntries,
  type HandledFish,
  type HandledStatus,
} from "@/lib/data";
import { Container, Card, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Handler Dashboard",
  description:
    "Track every fish you're benching in one place — class, division, owner, and live status.",
};

const STATUS: Record<HandledStatus, { label: string; cls: string; rank: number }> = {
  Champion: { label: "Division Champion", cls: "border-gold bg-gold/15 text-gold-bright", rank: 0 },
  "1st": { label: "1st — Class Champion", cls: "border-gold bg-gold/15 text-gold-bright", rank: 1 },
  Prince: { label: "Prince (OCV 1st)", cls: "border-gold bg-gold/15 text-gold-bright", rank: 1 },
  "2nd": { label: "2nd Place", cls: "border-silver/60 bg-silver/10 text-silver", rank: 2 },
  "3rd": { label: "3rd Place", cls: "border-bronze/60 bg-bronze/10 text-bronze", rank: 3 },
  Candidate: { label: "Candidate — Division Champion", cls: "border-blue/50 bg-blue/10 text-blue-bright", rank: 4 },
  Judging: { label: "Under judging", cls: "border-line-strong bg-surface-2 text-muted", rank: 5 },
  Benched: { label: "Benched in", cls: "border-line bg-surface-2 text-faint", rank: 6 },
  Reclassed: { label: "Reclassed", cls: "border-blue/50 bg-blue/10 text-blue-bright", rank: 7 },
  OUT: { label: "OUT", cls: "border-danger/50 bg-danger/10 text-danger", rank: 8 },
};

export default function HandlerDashboardPage() {
  const entries = [...handlerEntries].sort(
    (a, b) => STATUS[a.status].rank - STATUS[b.status].rank,
  );

  const podium = entries.filter((e) =>
    ["Champion", "1st", "Prince", "2nd", "3rd"].includes(e.status),
  ).length;
  const advancing = entries.filter(
    (e) => e.status === "Candidate" || e.status === "Champion",
  ).length;
  const out = entries.filter((e) => e.status === "OUT").length;

  const stats = [
    { label: "Fish handled", value: entries.length },
    { label: "Podium finishes", value: podium },
    { label: "Advancing", value: advancing },
    { label: "OUT", value: out },
  ];

  if (!currentHandler.verified) {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Verification pending</h1>
        <p className="mt-2 text-muted">
          The dashboard unlocks once an organizer makes you an official handler.
        </p>
        <Button href="/handlers" className="mt-6">
          Back to Handlers
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Handler Dashboard
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            “{currentHandler.alias}”
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            {currentHandler.name} · {currentHandler.region}
            <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
              ✓ Verified
            </span>
          </p>
        </div>
        <Button href="/track" variant="outline">
          Scan a QR
        </Button>
      </div>

      {/* Two-way note */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/[0.05] p-4 text-sm text-muted">
        <span className="text-lg">🤝</span>
        <p>
          <span className="font-semibold text-fg">Two-way tracking.</span> Every
          fish below shows its owner — and on each owner&apos;s status view,{" "}
          <span className="text-fg">you</span> appear as their handler. You both
          see the same live result.
        </p>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
              {s.label}
            </div>
            <div className="mt-1 font-display text-2xl font-bold tabular-nums text-gold">
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Handled fish */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold">My handled fish</h2>
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[auto_1fr_1fr_auto] gap-4 border-b border-line px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-faint sm:grid">
            <span>Code</span>
            <span>Class / Division</span>
            <span>Owner</span>
            <span className="text-right">Status</span>
          </div>
          {entries.map((e) => (
            <HandledRow key={e.code} entry={e} />
          ))}
        </Card>
      </div>
    </Container>
  );
}

function HandledRow({ entry: e }: { entry: HandledFish }) {
  const s = STATUS[e.status];
  return (
    <div className="grid grid-cols-1 items-center gap-2 border-b border-line/50 px-5 py-4 last:border-0 sm:grid-cols-[auto_1fr_1fr_auto] sm:gap-4">
      <Link
        href={`/track?code=${encodeURIComponent(e.code)}`}
        className="font-mono text-base font-bold text-gold hover:text-gold-bright"
      >
        {e.code}
      </Link>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-fg">
          {e.className}
        </div>
        <div className="truncate text-xs text-muted">
          {e.division} ({e.divisionAbbr})
        </div>
        {e.note && (
          <div className="mt-0.5 text-[11px] text-danger/90">📝 {e.note}</div>
        )}
      </div>
      <div className="min-w-0 text-sm">
        <span className="text-faint sm:hidden">Owner: </span>
        <Link
          href={`/players/${e.ownerId}`}
          className="text-fg hover:text-gold"
        >
          {e.owner}
        </Link>
        <div className="truncate text-xs text-faint">{e.show}</div>
      </div>
      <div className="sm:text-right">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${s.cls}`}
        >
          {e.status === "Judging" && (
            <span className="size-1.5 rounded-full bg-current animate-live" />
          )}
          {s.label}
        </span>
      </div>
    </div>
  );
}
