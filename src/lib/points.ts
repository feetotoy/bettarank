/**
 * FINOY official points system. Awards earned at sanctioned shows convert to
 * national points using the tables below. Player standings are the sum of a
 * player's award points; Team and Breeder standings aggregate player points
 * (see the helpers at the bottom).
 */

export type AwardTier = "Regular" | "Junior";

// Award/placement keys used across the platform.
export type AwardKey =
  | "best-of-show" // Regular only
  | "best-in-optional" // Junior only
  | "major" // Division Champion, Category Champion, etc.
  | "first" // 1st, or Prince (OCV)
  | "second"
  | "third";

// Points per award, per tier. `null` = not awarded in that tier.
export const POINTS: Record<AwardTier, Record<AwardKey, number | null>> = {
  Regular: {
    "best-of-show": 100,
    "best-in-optional": null,
    major: 50,
    first: 30,
    second: 20,
    third: 10,
  },
  Junior: {
    "best-of-show": null,
    "best-in-optional": 50,
    major: 25,
    first: 15,
    second: 10,
    third: 5,
  },
};

/** Points for a single award in a given tier (0 if not applicable). */
export function awardPoints(tier: AwardTier, award: AwardKey): number {
  return POINTS[tier][award] ?? 0;
}

/** A player's total from a tally of the awards they won, across both tiers. */
export interface AwardTally {
  bestOfShow?: number; // Regular
  bestInOptional?: number; // Junior
  major?: number;
  first?: number;
  second?: number;
  third?: number;
}
export function pointsFromTally(tier: AwardTier, t: AwardTally): number {
  return (
    (t.bestOfShow ?? 0) * awardPoints(tier, "best-of-show") +
    (t.bestInOptional ?? 0) * awardPoints(tier, "best-in-optional") +
    (t.major ?? 0) * awardPoints(tier, "major") +
    (t.first ?? 0) * awardPoints(tier, "first") +
    (t.second ?? 0) * awardPoints(tier, "second") +
    (t.third ?? 0) * awardPoints(tier, "third")
  );
}

/**
 * Team standing = sum of the points of its players.
 * Breeder standing = sum of the points of the players who tagged that breeder.
 * Both reduce to summing a set of players' point totals.
 */
export function sumPlayerPoints(players: { points: number }[]): number {
  return players.reduce((s, p) => s + p.points, 0);
}

// Human-readable breakdown for the public "how points work" reference.
export const POINTS_REFERENCE: {
  tier: AwardTier;
  rows: { label: string; pts: number }[];
}[] = [
  {
    tier: "Regular",
    rows: [
      { label: "Best of Show", pts: 100 },
      { label: "Major Awards (Division / Category Champion, etc.)", pts: 50 },
      { label: "1st Placer / Prince (OCV)", pts: 30 },
      { label: "2nd Placer", pts: 20 },
      { label: "3rd Placer", pts: 10 },
    ],
  },
  {
    tier: "Junior",
    rows: [
      { label: "Best in Optional", pts: 50 },
      { label: "Major Awards (Category / Division Champion)", pts: 25 },
      { label: "1st Placer / Prince (OCV)", pts: 15 },
      { label: "2nd Placer", pts: 10 },
      { label: "3rd Placer", pts: 5 },
    ],
  },
];
