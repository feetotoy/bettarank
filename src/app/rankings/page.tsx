import type { Metadata } from "next";
import {
  playerRankings,
  breederRankings,
  teamRankings,
  handlerRankings,
} from "@/lib/data";
import { Container, Card, SectionHeading } from "@/components/ui";
import { POINTS_REFERENCE } from "@/lib/points";
import { RankingsPortal } from "./portal";

export const metadata: Metadata = {
  title: "National Rankings",
  description:
    "Official FINOY national standings — players, breeders, teams, and handlers ranked by championships won.",
};

export default function RankingsPage() {
  const players = playerRankings();
  return (
    <Container className="py-14">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          National Standings
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          FINOY National Rankings
        </h1>
        <p className="mt-3 text-muted">
          Live championship standings across the Philippine betta community.
          Players are ranked by the titles their fish have won — tap any player
          to see the fish behind the ranking.
        </p>
      </div>

      <div className="mt-10">
        <RankingsPortal
          players={players}
          breeders={breederRankings}
          teams={teamRankings}
          handlers={handlerRankings}
        />
      </div>

      {/* How points are earned — the official scoring system */}
      <div className="mt-16">
        <SectionHeading eyebrow="Scoring" title="How points are earned" />
        <p className="-mt-4 mb-6 max-w-2xl text-muted">
          Every award won at a sanctioned show converts to national points. A
          player&apos;s standing is the sum of their points; a{" "}
          <span className="text-fg">team&apos;s</span> is the combined points of
          its players; a <span className="text-fg">breeder&apos;s</span> is the
          combined points of every player who tagged them.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {POINTS_REFERENCE.map((g) => (
            <Card key={g.tier} className="overflow-hidden">
              <div className="border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                {g.tier} Division
              </div>
              {g.rows.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between gap-4 border-b border-line/50 px-5 py-3 last:border-0"
                >
                  <span className="text-sm text-fg">{r.label}</span>
                  <span className="shrink-0 font-display text-base font-bold tabular-nums text-gold">
                    {r.pts} pts
                  </span>
                </div>
              ))}
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <span>🛡️</span> Team points
            </div>
            <p className="mt-1 text-sm text-muted">
              The combined points of all the team&apos;s players.
            </p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <span>🧬</span> Breeder points
            </div>
            <p className="mt-1 text-sm text-muted">
              The combined points of every player who tagged that breeder.
            </p>
          </Card>
        </div>
      </div>
    </Container>
  );
}
