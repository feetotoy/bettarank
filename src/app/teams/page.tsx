import type { Metadata } from "next";
import Link from "next/link";
import { teamProfiles } from "@/lib/data";
import { Container, Card, Pill } from "@/components/ui";
import { TeamRegister } from "./team-register";

export const metadata: Metadata = {
  title: "Teams of the Philippines",
  description:
    "Discover every betta club & team in the Philippines. Browse rosters, view team rankings, and contact a team to join.",
};

export default function TeamsPage() {
  const teams = teamProfiles();
  const recruiting = teams.filter((t) => t.recruiting).length;

  return (
    <Container className="py-14">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          National Directory
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Teams of the Philippines
        </h1>
        <p className="mt-3 text-muted">
          Every registered betta club nationwide. Explore their roster and
          achievements, then reach out to join — {recruiting} teams are
          recruiting right now.
        </p>
      </div>

      {/* Register CTA */}
      <div className="mt-10">
        <TeamRegister />
      </div>

      {/* Directory grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card
            key={team.id}
            as="article"
            className="group flex flex-col p-6 transition-colors hover:border-line-strong"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-gold/30 bg-surface-2 text-2xl">
                  {team.logo}
                </div>
                <span className="font-display text-sm font-bold text-faint">
                  #{team.rank}
                </span>
              </div>
              {team.recruiting ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-success">
                  <span className="size-1.5 rounded-full bg-success animate-live" />
                  Recruiting
                </span>
              ) : (
                <span className="rounded-full border border-line bg-surface-3 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
                  Roster full
                </span>
              )}
            </div>

            <h2 className="mt-4 font-display text-lg font-bold text-fg transition-colors group-hover:text-gold">
              {team.name}
            </h2>
            <p className="mt-1 text-sm italic text-muted">“{team.tagline}”</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>{team.region}</Pill>
              <Pill>{team.members} members</Pill>
              <Pill>{team.championships} titles</Pill>
            </div>

            <div className="mt-5 flex items-end justify-between border-t border-line/60 pt-4">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
                  Championships
                </div>
                <div className="font-display text-xl font-bold tabular-nums text-gold">
                  {team.championships}
                </div>
              </div>
              <Link
                href={`/teams/${team.id}`}
                className="text-sm font-semibold text-gold transition-colors group-hover:text-gold-bright"
              >
                View team →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
