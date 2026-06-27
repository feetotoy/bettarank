import type { Metadata } from "next";
import {
  playerRankings,
  breederRankings,
  teamRankings,
  handlerRankings,
} from "@/lib/data";
import { Container } from "@/components/ui";
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
    </Container>
  );
}
