import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { teamRankings, getTeam } from "@/lib/data";
import { Container, Card, Button, Pill } from "@/components/ui";
import { SocialLinks } from "@/components/social-links";
import { JoinTeam } from "./join";
import { MemberGate } from "./member-gate";

export function generateStaticParams() {
  return teamRankings.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const team = getTeam(id);
  if (!team) return { title: "Team not found" };
  return {
    title: team.name,
    description: `${team.tagline} — ${team.region} betta team, ${team.championships} championships. ${team.about}`,
  };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = getTeam(id);
  if (!team) notFound();

  return (
    <>
      {/* Banner */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-surface-2 via-surface to-ink">
        <div className="absolute inset-0 bg-[radial-gradient(70%_120%_at_50%_-10%,rgba(243,198,19,0.16),transparent)]" />
        <Container className="relative py-12">
          <Button href="/teams" variant="ghost" className="mb-6 px-0">
            ← All teams
          </Button>
          <div className="flex items-center gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl border border-gold/30 bg-surface/70 text-4xl shadow-[0_0_30px_-10px_rgba(243,198,19,0.5)]">
              {team.logo}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
                  ★ National #{team.rank}
                </span>
                <Pill>{team.region}</Pill>
                {team.recruiting && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-success">
                    <span className="size-1.5 rounded-full bg-success animate-live" />
                    Recruiting
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
                {team.name}
              </h1>
              <p className="mt-2 text-lg italic text-muted">
                “{team.tagline}”
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Stat ribbon */}
      <Container className="-mt-px">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-b-2xl border border-t-0 border-line bg-line sm:grid-cols-4">
          {[
            { label: "Championships", value: team.championships },
            { label: "Members", value: team.members },
            { label: "National Rank", value: `#${team.rank}` },
            { label: "Founded", value: team.founded },
          ].map((s) => (
            <div key={s.label} className="bg-surface px-5 py-6 text-center">
              <div className="font-display text-2xl font-bold tabular-nums text-gold">
                {s.value}
              </div>
              <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-faint">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Container>

      <Container className="grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="order-2 lg:order-1">
          <h2 className="font-display text-xl font-bold">About the team</h2>
          <p className="mt-3 leading-7 text-muted">{team.about}</p>

          <div className="mt-10 flex items-center gap-3">
            <h2 className="font-display text-xl font-bold">Key Roles</h2>
            <span className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-faint">
              Public
            </span>
          </div>
          <Card className="mt-4 overflow-hidden">
            {team.roster.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-line/50 px-5 py-4 last:border-0"
              >
                <span className="flex size-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-display text-sm font-bold text-gold">
                  {m.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <div className="font-semibold text-fg">{m.name}</div>
                  <div className="text-xs text-muted">{m.role}</div>
                </div>
              </div>
            ))}
          </Card>

          {/* Members-only roster */}
          <div className="mt-10">
            <MemberGate teamName={team.name} members={team.privateMembers} />
          </div>

          <h2 className="mt-10 font-display text-xl font-bold">Achievements</h2>
          <div className="mt-4 space-y-3">
            {team.achievements.map((a) => (
              <Card key={a} className="flex items-center gap-3 p-4">
                <span className="text-2xl">🏆</span>
                <span className="text-sm font-medium text-fg">{a}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar — contact / join */}
        <aside className="order-1 space-y-4 lg:order-2">
          <JoinTeam
            teamName={team.name}
            email={team.email}
            phone={team.phone}
            recruiting={team.recruiting}
          />
          <Card className="p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-faint">
              Team captain
            </h3>
            <p className="mt-3 font-display text-lg font-bold text-fg">
              {team.captain}
            </p>
            <p className="text-sm text-muted">{team.homeBase}</p>
          </Card>
          {team.socials && (
            <Card className="p-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-faint">
                Connect
              </h3>
              <p className="mt-2 text-sm text-muted">
                Follow {team.name} on social media.
              </p>
              <SocialLinks socials={team.socials} className="mt-3" />
            </Card>
          )}
        </aside>
      </Container>
    </>
  );
}
