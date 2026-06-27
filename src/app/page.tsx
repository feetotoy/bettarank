import Link from "next/link";
import {
  competitions,
  playerRankings,
  playerMedals,
  hallOfFame2026,
  platformStats,
  sponsors,
  compactNumber,
} from "@/lib/data";
import {
  Container,
  SectionHeading,
  Card,
  Button,
  RankMedal,
  RankDelta,
} from "@/components/ui";
import { CompetitionCard } from "@/components/competition-card";
import { QrCode } from "@/components/qr-code";
import { getLocale } from "@/lib/i18n-server";
import { getDict } from "@/lib/i18n";

export default async function HomePage() {
  const t = getDict(await getLocale()).hero;
  const upcoming = competitions
    .filter((c) => c.status !== "completed")
    .slice(0, 3);
  const topPlayers = playerRankings().slice(0, 5);

  return (
    <>
      {/* ---------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden">
        <Container className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="size-1.5 rounded-full bg-gold animate-live" />
              {t.badge}
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {t.titleA}
              <br />
              <span className="text-gradient-gold">{t.titleB}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
              {t.subtitle}{" "}
              <span className="font-semibold text-fg">{t.halika}</span>
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button href="/competitions">{t.explore}</Button>
              <Button href="/rankings" variant="outline">
                {t.rankings}
              </Button>
              <Button href="/about" variant="ghost">
                {t.whatIs}
              </Button>
            </div>
          </div>

          {/* Stat strip */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-5">
            {[
              { label: "Competitions", value: platformStats.competitions },
              { label: "Fish Registered", value: platformStats.fishRegistered },
              { label: "Breeders", value: platformStats.breeders },
              { label: "Teams", value: platformStats.teams },
              { label: "Titles Awarded", value: platformStats.titlesAwarded },
            ].map((s) => (
              <div key={s.label} className="bg-surface px-4 py-6 text-center">
                <div className="font-display text-2xl font-bold tabular-nums text-gold sm:text-3xl">
                  {compactNumber(s.value)}
                </div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-faint">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------- WHAT IS FINOY */}
      <Container className="py-16">
        <div className="overflow-hidden rounded-3xl border border-line bg-surface/50">
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.25fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                What is FINOY?
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Filipino Integrated Network for{" "}
                <span className="text-gradient-gold">
                  Ornamental Fish Yielding Excellence
                </span>
              </h2>
              <p className="mt-4 leading-7 text-muted">
                More than a name — a movement.{" "}
                <span className="font-semibold text-fg">FIN</span> is every
                breeder, hobbyist, judge, club, and organizer who shares the
                passion. <span className="font-semibold text-fg">OY</span> is the
                Filipino invitation —{" "}
                <span className="italic text-fg">“Halika! Join us.”</span> One
                platform unifying every competition, participant, and organizer
                under a single national standard.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/about">Learn the FINOY story →</Button>
                <Button href="/register" variant="outline">
                  Register a Fish
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                {
                  icon: "★★★",
                  t: "Three Stars",
                  d: "Luzon · Visayas · Mindanao",
                },
                {
                  icon: "🏆",
                  t: "Golden Trophy",
                  d: "Fairness, integrity & excellence",
                },
                { icon: "🌅", t: "Rising Sun", d: "A new dawn for the hobby" },
              ].map((m) => (
                <div
                  key={m.t}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-surface-2/60 p-4"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-lg tracking-tighter text-gold">
                    {m.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold text-fg">
                      {m.t}
                    </div>
                    <div className="text-xs text-muted">{m.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* -------------------------------------------------- UPCOMING + LIVE */}
      <Container className="py-16">
        <SectionHeading
          eyebrow="Calendar"
          title="Upcoming & Live Competitions"
          action={
            <Button href="/competitions" variant="ghost">
              View all →
            </Button>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((comp) => (
            <CompetitionCard key={comp.slug} comp={comp} />
          ))}
        </div>
      </Container>

      {/* ------------------------------------------------- NATIONAL RANKINGS */}
      <Container className="py-16">
        <SectionHeading
          eyebrow="Leaderboard"
          title="National Player Rankings"
          action={
            <Button href="/rankings" variant="ghost">
              Full rankings →
            </Button>
          }
        />
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[auto_1fr_auto] gap-4 border-b border-line px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-faint sm:grid">
            <span>Rank</span>
            <span>Player</span>
            <span className="text-right">Titles</span>
          </div>
          {topPlayers.map((player, i) => (
            <Link
              key={player.id}
              href={`/players/${player.id}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-line/60 px-4 py-4 transition-colors last:border-0 hover:bg-surface-2 sm:gap-4 sm:px-6"
            >
              <div className="flex items-center gap-2">
                <RankMedal rank={i + 1} />
                <RankDelta current={i + 1} previous={player.previousRank} />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-fg">
                  {player.name}
                </div>
                <div className="truncate text-xs text-muted">
                  {player.team} · {player.region}
                </div>
                {/* What they won — the reason for the ranking */}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {playerMedals(player).map((m) => (
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
              <div className="text-right font-display text-base font-bold tabular-nums text-gold">
                {player.championships}
              </div>
            </Link>
          ))}
        </Card>
      </Container>

      {/* ----------------------------------------------------- HOW IT WORKS */}
      <Container className="py-16">
        <SectionHeading eyebrow="The Ecosystem" title="One platform, every role" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "🏆",
              title: "Organizers",
              body: "Create competitions, configure categories & fees, approve payments, and publish live results.",
            },
            {
              icon: "🧬",
              title: "Breeders",
              body: "Register fish online, build lifetime fish passports, and climb the national breeder rankings.",
            },
            {
              icon: "⚖️",
              title: "Judges",
              body: "Score digitally on tablet across five criteria. Rankings compute the instant scores are finalized.",
            },
            {
              icon: "✋",
              title: "Handlers (Joki)",
              body: "Manage assigned fish, bench in/out by QR scan, and print labels in one tap.",
            },
            {
              icon: "📊",
              title: "National Rankings",
              body: "Championship standings for players, breeders, teams & handlers — updated automatically nationwide.",
            },
            {
              icon: "🇵🇭",
              title: "Spectators",
              body: "Follow live leaderboards, search any fish passport, and track regional & national standings.",
            },
          ].map((f) => (
            <Card
              key={f.title}
              className="p-6 transition-colors hover:border-line-strong"
            >
              <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-xl">
                {f.icon}
              </div>
              <h3 className="font-display text-base font-bold text-fg">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">{f.body}</p>
            </Card>
          ))}
        </div>
      </Container>

      {/* ------------------------------------------------------ HALL OF FAME */}
      <Container className="py-16">
        <SectionHeading
          eyebrow="2026 Season"
          title="Hall of Fame"
          action={
            <Button href="/hall-of-fame" variant="ghost">
              Archive →
            </Button>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hallOfFame2026.slice(0, 3).map((entry) => (
            <Card
              key={entry.title}
              className="relative overflow-hidden p-6 text-center"
            >
              <div className="absolute inset-x-0 top-0 h-px divider-gold" />
              <div className="text-4xl">{entry.icon}</div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                {entry.title}
              </p>
              <p className="mt-2 font-display text-xl font-bold text-fg">
                {entry.winner}
              </p>
              <p className="mt-1 text-sm text-muted">{entry.detail}</p>
            </Card>
          ))}
        </div>
      </Container>

      {/* ------------------------------------------------- QR CODE SYSTEM */}
      <Container className="py-16">
        <div className="grid items-center gap-10 rounded-3xl border border-line bg-surface/40 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              QR Code System
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Every fish, one scan away
            </h2>
            <p className="mt-3 text-muted">
              A core pillar of the platform. Every entry gets a QR-coded bench
              sticker, so organizers can manage the floor at the speed of a scan.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                {
                  icon: "📷",
                  t: "Scan to edit",
                  d: "Organizers scan a fish's QR to instantly reclass it, update rankings, or fix details.",
                },
                {
                  icon: "🔑",
                  t: "Faded sticker? Use the code",
                  d: "Thermal labels fade with water — look the fish up by its bench code (e.g. A1 - 001) instead.",
                },
                {
                  icon: "🖨",
                  t: "Thermal sticker printing",
                  d: "One-tap labels with the QR, the bold bench code, and an “A Finoy Masterpiece” footer.",
                },
              ].map((f) => (
                <li key={f.t} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-base">
                    {f.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-fg">{f.t}</p>
                    <p className="text-sm text-muted">{f.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Sticker mock */}
          <div className="flex justify-center">
            <div className="w-[300px] rotate-1 rounded-xl bg-white p-4 text-black shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]">
              <div className="flex items-baseline justify-between gap-2 border-b border-black pb-1.5">
                <span className="truncate text-[12px] font-extrabold uppercase tracking-wide">
                  Cebu City Betta Showdown
                </span>
                <span className="shrink-0 text-[11px] font-semibold">
                  Jun 24, 2026
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                <div className="size-[84px] shrink-0">
                  <QrCode value="https://finoy.pet/track?code=A1-001" size={84} />
                </div>
                <div className="min-w-0 flex-1 text-center">
                  <div className="text-6xl font-black leading-none tracking-tight">
                    A1-001
                  </div>
                  <div className="mt-1.5 truncate text-[11px] text-neutral-500">
                    Class + Tank No.
                  </div>
                </div>
              </div>
              <div className="mt-2.5 border-t border-black pt-1.5 text-center text-[11px]">
                A <b className="font-extrabold">Finoy</b> Masterpiece
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ----------------------------------------------------------- CTA */}
      <Container className="py-16">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-surface-2 via-surface to-ink p-10 text-center sm:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(243,198,19,0.15),transparent)]" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              One Nation · One Community · One Platform
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Where every fin has a story.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Whether you&apos;re buying your very first fish or you&apos;re a
              Grand Champion breeder, FINOY welcomes you. Every great fishkeeper
              started with someone saying,{" "}
              <span className="italic text-fg">“Oy, try mo ’to.”</span>
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/register">Register a Fish</Button>
              <Button href="/about" variant="outline">
                Learn the FINOY story →
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* ------------------------------------------------------- SPONSORS */}
      <Container className="pb-8 pt-4">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-faint">
          Official Partners & Sponsors
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {sponsors.map((s) => (
            <span
              key={s}
              className="font-display text-sm font-bold uppercase tracking-wide text-faint/80 transition-colors hover:text-muted"
            >
              {s}
            </span>
          ))}
        </div>
      </Container>
    </>
  );
}
