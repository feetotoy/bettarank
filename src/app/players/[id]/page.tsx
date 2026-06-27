import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  playerRankings,
  getPlayer,
  getTeam,
  playerMedals,
  currentPlayer,
} from "@/lib/data";
import { Container, Card, Button, Pill } from "@/components/ui";
import { SocialLinks } from "@/components/social-links";
import { ProfileAvatar } from "./profile-avatar";

export function generateStaticParams() {
  return playerRankings().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) return { title: "Player not found" };
  return {
    title: `${player.name} — Player Profile`,
    description: `${player.name} of ${player.team}. ${player.bestOfShow} Best of Show, ${player.divisionChampions} Division Champions, ${player.firstPlace} 1st placers.`,
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) notFound();

  const rank = playerRankings().findIndex((p) => p.id === player.id) + 1;
  const medals = playerMedals(player);
  const teamSlug = player.team
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const teamLogo = getTeam(teamSlug)?.logo;
  const isMe = currentPlayer.loggedIn && currentPlayer.id === player.id;

  return (
    <Container className="py-10 sm:py-12">
      <Button href="/rankings" variant="ghost" className="mb-6 px-0">
        ← Back to rankings
      </Button>

      {/* Player header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 divider-gold" />
        {/* Team watermark — the badge of the club this player belongs to */}
        {teamLogo && (
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-10 select-none text-[11rem] leading-none opacity-[0.06] sm:text-[14rem]"
          >
            {teamLogo}
          </div>
        )}
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-4">
            <ProfileAvatar name={player.name} initialPhoto={player.photo} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
                  ★ National #{rank}
                </span>
                {isMe && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-success/40 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success">
                    ● Your profile
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-gold">
                  {player.points.toLocaleString()} pts
                </span>
                <Pill>{player.region}</Pill>
              </div>
              <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
                {player.name}
              </h1>
              <Link
                href={`/teams/${teamSlug}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-gold"
              >
                {teamLogo && <span aria-hidden>{teamLogo}</span>}
                {player.team}
              </Link>
              <SocialLinks
                socials={player.socials}
                size="sm"
                className="mt-2.5"
              />
            </div>
          </div>
        </div>

        {/* Stat ribbon */}
        <div className="relative grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-5">
          {[
            { label: "Season Points", value: player.points.toLocaleString() },
            { label: "Best of Show", value: player.bestOfShow },
            { label: "Division Champions", value: player.divisionChampions },
            { label: "1st Placers", value: player.firstPlace },
            { label: "Win Rate", value: `${player.winRate}%` },
          ].map((s) => (
            <div key={s.label} className="bg-surface px-4 py-5 text-center">
              <div className="font-display text-xl font-bold tabular-nums text-gold sm:text-2xl">
                {s.value}
              </div>
              <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-faint sm:text-[11px]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* The "why" — the awards won, never the fish names */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold sm:text-2xl">
          Why {player.name.split(" ")[0]} ranks #{rank}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Standing is built purely on results — the classes and awards won across
          the season. Fish stay anonymous to keep judging fair.
        </p>

        <div className="mt-5 space-y-3">
          {medals.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface/60 p-4"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-2xl">
                {m.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-bold text-fg">
                  {m.label}
                  {m.count > 1 ? "s" : ""}
                </div>
                <div className="text-xs text-muted">
                  {m.label === "Best of Show"
                    ? "The top fish of an entire show"
                    : m.label === "Division Champion"
                      ? "Champion across a full division"
                      : "Class placement"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold tabular-nums text-gold">
                  {m.count}×
                </div>
              </div>
            </div>
          ))}
          {medals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line py-8 text-center text-sm text-faint">
              No awards on record yet this season.
            </div>
          )}
        </div>

        {/* Summary line */}
        <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/[0.05] px-5 py-4 text-center text-sm text-fg">
          <span className="font-semibold">{player.name}</span> ranks{" "}
          <span className="font-bold text-gold">#{rank}</span> on{" "}
          {medals.map((m, i) => (
            <span key={m.label}>
              {i > 0 ? ", " : ""}
              <span className="font-semibold text-gold">
                {m.count} {m.label}
                {m.count > 1 ? "s" : ""}
              </span>
            </span>
          ))}
          .
        </div>
      </div>
    </Container>
  );
}
