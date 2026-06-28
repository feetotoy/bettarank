import {
  playerRankings,
  breederRankings,
  teamRankings,
  type Competition,
} from "@/lib/data";
import { getCompetitions } from "@/lib/db/competitions";

/**
 * Platform stats DERIVED from the live data (DB when configured, else mock) so
 * the headline numbers on the homepage and About page always agree with what
 * the rest of the site actually shows. SERVER ONLY (pulls in the DB layer).
 */
export interface PlatformStats {
  competitions: number;
  fishRegistered: number;
  breeders: number;
  teams: number;
  titlesAwarded: number;
}

export async function getPlatformStats(
  comps?: Competition[],
): Promise<PlatformStats> {
  const competitions = comps ?? (await getCompetitions());
  const players = playerRankings();
  return {
    competitions: competitions.length,
    fishRegistered: competitions.reduce((sum, c) => sum + c.entries, 0),
    breeders: breederRankings.length,
    teams: teamRankings.length,
    // Total headline titles (Best of Show + Division Champions + 1st placers).
    titlesAwarded: players.reduce((sum, p) => sum + p.championships, 0),
  };
}
