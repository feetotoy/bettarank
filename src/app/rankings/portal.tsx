"use client";

import { useState } from "react";
import Link from "next/link";
import type { Player, Breeder, Team, Handler } from "@/lib/data";
import { playerMedals } from "@/lib/data";
import { RankMedal, RankDelta, Card } from "@/components/ui";
import { SocialLinks } from "@/components/social-links";

type Tab = "players" | "breeders" | "teams" | "handlers";

const TABS: { key: Tab; label: string }[] = [
  { key: "players", label: "Players" },
  { key: "breeders", label: "Breeders" },
  { key: "teams", label: "Teams" },
  { key: "handlers", label: "Handlers" },
];

export function RankingsPortal({
  players,
  breeders,
  teams,
  handlers,
}: {
  players: Player[];
  breeders: Breeder[];
  teams: Team[];
  handlers: Handler[];
}) {
  const [tab, setTab] = useState<Tab>("players");

  return (
    <div>
      {/* Scrollable on mobile so all tabs stay reachable */}
      <div className="mb-6 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="inline-flex rounded-full border border-line bg-surface/60 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-5 ${
                tab === t.key
                  ? "bg-gradient-to-b from-gold-bright to-gold text-ink"
                  : "text-muted hover:text-fg"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {tab === "players" && <PlayerTable rows={players} />}
        {tab === "breeders" && <BreederTable rows={breeders} />}
        {tab === "teams" && <TeamTable rows={teams} />}
        {tab === "handlers" && <HandlerTable rows={handlers} />}
      </Card>
    </div>
  );
}

function PlayerTable({ rows }: { rows: Player[] }) {
  return (
    <div>
      <div className="hidden grid-cols-[auto_1fr_auto_auto] gap-4 border-b border-line px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-faint sm:grid">
        <span>Rank</span>
        <span>Player</span>
        <span className="text-right">Win&nbsp;Rate</span>
        <span className="text-right">Titles</span>
      </div>
      {rows.map((p, i) => (
        <Link
          key={p.id}
          href={`/players/${p.id}`}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-line/50 px-4 py-4 transition-colors last:border-0 hover:bg-surface-2 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-4 sm:px-6"
        >
          <div className="flex items-center gap-2">
            <RankMedal rank={i + 1} />
            <RankDelta current={i + 1} previous={p.previousRank} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-fg">{p.name}</div>
            <div className="truncate text-xs text-muted">
              {p.team} · {p.region}
            </div>
            {/* What they won — the reason for the ranking */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {playerMedals(p).map((m) => (
                <span
                  key={m.label}
                  className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted"
                >
                  <span>{m.icon}</span>
                  {m.count} {m.short}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden text-right text-sm tabular-nums text-muted sm:block">
            {p.winRate}%
          </div>
          <div className="text-right">
            <div className="font-display text-base font-bold tabular-nums text-gold">
              {p.championships}
            </div>
            <div className="text-[10px] tabular-nums text-faint">
              {p.points.toLocaleString()} pts
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function BreederTable({ rows }: { rows: Breeder[] }) {
  return (
    <div>
      <div className="hidden grid-cols-[auto_1fr_auto_auto_auto] gap-4 border-b border-line px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-faint sm:grid">
        <span>Rank</span>
        <span>Breeder</span>
        <span className="text-right">Fish</span>
        <span className="text-right">Win&nbsp;Rate</span>
        <span className="text-right">Titles</span>
      </div>
      {rows.map((b, i) => (
        <div
          key={b.id}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-line/50 px-4 py-4 last:border-0 sm:grid-cols-[auto_1fr_auto_auto_auto] sm:gap-4 sm:px-6"
        >
          <div className="flex items-center gap-2">
            <RankMedal rank={i + 1} />
            <RankDelta current={i + 1} previous={b.previousRank} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-fg">{b.farm}</div>
            <div className="truncate text-xs text-muted">
              {b.name} · {b.region}
            </div>
            <SocialLinks socials={b.socials} size="sm" className="mt-1.5" />
          </div>
          <div className="hidden text-right text-sm tabular-nums text-muted sm:block">
            {b.fish}
          </div>
          <div className="hidden text-right text-sm tabular-nums text-muted sm:block">
            {b.winRate}%
          </div>
          <div className="text-right">
            <div className="font-display text-base font-bold tabular-nums text-gold">
              {b.championships}
            </div>
            <div className="text-[10px] tabular-nums text-faint">
              {b.points.toLocaleString()} pts
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamTable({ rows }: { rows: Team[] }) {
  return (
    <div>
      <div className="hidden grid-cols-[auto_1fr_auto_auto] gap-4 border-b border-line px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-faint sm:grid">
        <span>Rank</span>
        <span>Team</span>
        <span className="text-right">Members</span>
        <span className="text-right">Titles</span>
      </div>
      {rows.map((t, i) => (
        <Link
          key={t.id}
          href={`/teams/${t.id}`}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-line/50 px-4 py-4 transition-colors last:border-0 hover:bg-surface-2 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-4 sm:px-6"
        >
          <div className="flex items-center gap-2">
            <RankMedal rank={i + 1} />
            <RankDelta current={i + 1} previous={t.previousRank} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-fg">{t.name}</div>
            <div className="truncate text-xs text-muted">
              {t.region} · {t.members} members
            </div>
          </div>
          <div className="hidden text-right text-sm tabular-nums text-muted sm:block">
            {t.members}
          </div>
          <div className="text-right">
            <div className="font-display text-base font-bold tabular-nums text-gold">
              {t.championships}
            </div>
            <div className="text-[10px] tabular-nums text-faint">
              {t.points.toLocaleString()} pts
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function HandlerTable({ rows }: { rows: Handler[] }) {
  return (
    <div>
      <div className="hidden grid-cols-[auto_1fr_auto_auto] gap-4 border-b border-line px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-faint sm:grid">
        <span>Rank</span>
        <span>Handler</span>
        <span className="text-right">Fish</span>
        <span className="text-right">Accuracy</span>
      </div>
      {rows.map((h, i) => (
        <div
          key={h.id}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-line/50 px-4 py-4 last:border-0 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-4 sm:px-6"
        >
          <div className="flex items-center gap-2">
            <RankMedal rank={i + 1} />
            <RankDelta current={i + 1} previous={h.previousRank} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-fg">“{h.alias}”</div>
            <div className="truncate text-xs text-muted">
              {h.name} · {h.region}
            </div>
          </div>
          <div className="hidden text-right text-sm tabular-nums text-muted sm:block">
            {h.fishHandled}
          </div>
          <div className="text-right font-display text-base font-bold tabular-nums text-gold">
            {h.benchAccuracy}%
          </div>
        </div>
      ))}
    </div>
  );
}
