import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  competitions,
  formatDate,
  peso,
  showStandings,
  showDivisionResults,
  showJudging,
  type ShowRankRow,
} from "@/lib/data";
import { getCompetitionBySlug } from "@/lib/db/competitions";
import {
  Container,
  Card,
  Button,
  LevelBadge,
  StatusBadge,
  Pill,
  SectionHeading,
  RankMedal,
} from "@/components/ui";
import { ResultsBrowser } from "./results-browser";

export function generateStaticParams() {
  return competitions.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comp = await getCompetitionBySlug(slug);
  if (!comp) return { title: "Competition not found" };
  return {
    title: comp.name,
    description: `${comp.level} betta competition at ${comp.venue}, ${comp.city} on ${formatDate(comp.date)}.`,
  };
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comp = await getCompetitionBySlug(slug);
  if (!comp) notFound();

  const fillPct = Math.round((comp.entries / comp.maxEntries) * 100);
  const standings = comp.status !== "upcoming" ? showStandings(slug) : null;
  const divisionResults =
    comp.status !== "upcoming" ? showDivisionResults(slug) : null;
  const judging = showJudging(slug, comp.status);
  const majorSponsors = (comp.sponsors ?? []).filter((s) => s.tier === "major");
  const minorSponsors = (comp.sponsors ?? []).filter((s) => s.tier === "minor");

  return (
    <>
      {/* Hero banner */}
      <section className={`relative overflow-hidden border-b border-line bg-gradient-to-br ${comp.poster}`}>
        <div className="absolute inset-0 bg-[radial-gradient(70%_120%_at_50%_-10%,rgba(243,198,19,0.18),transparent)]" />
        <Container className="relative py-12">
          <div className="flex flex-wrap items-center gap-2">
            <LevelBadge level={comp.level} />
            <StatusBadge status={comp.status} />
            <Pill>{comp.region}</Pill>
            {comp.rankingCounts ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
                ★ National Ranking
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
                Exhibition · Unranked
              </span>
            )}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {comp.name}
          </h1>
          <p className="mt-3 text-lg text-muted">
            {comp.venue} · {comp.city}
          </p>
          <p className="mt-1 text-sm text-faint">
            Organized by {comp.organizer}
          </p>
          {comp.liveUrl && (
            <a
              href={comp.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-danger px-5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(229,51,79,0.7)] transition-transform hover:-translate-y-0.5"
            >
              {comp.status === "live" && (
                <span className="size-2 rounded-full bg-white animate-live" />
              )}
              🔴 Watch Live ↗
            </a>
          )}
        </Container>
      </section>

      <Container className="grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="order-2 lg:order-1">
          {comp.status !== "upcoming" ? (
            <>
              <h2 className="mb-5 font-display text-2xl font-bold tracking-tight">
                {comp.status === "live" ? "Live Results" : "Final Results"}
              </h2>
              {divisionResults && (
                <ResultsBrowser divisions={divisionResults} judging={judging} />
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-4xl">⏳</div>
              <h2 className="mt-3 font-display text-xl font-bold">
                Results not yet available
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Live leaderboards appear here once judging begins on{" "}
                {formatDate(comp.date)}. Registration is open until{" "}
                {formatDate(comp.registrationDeadline)}.
              </p>
              <div className="mt-6">
                <Button href="/register">Register a Fish</Button>
              </div>
            </Card>
          )}

          {/* Categories */}
          <h2 className="mb-4 mt-12 font-display text-2xl font-bold tracking-tight">
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {comp.categories.map((cat) => (
              <span
                key={cat}
                className="rounded-xl border border-line bg-surface-2 px-4 py-2 text-sm font-medium text-fg"
              >
                {cat}
              </span>
            ))}
          </div>

        </div>

        {/* Sidebar */}
        <aside className="order-1 space-y-4 lg:order-2">
          <Card className="p-6">
            <dl className="space-y-4 text-sm">
              <Detail label="Event date" value={formatDate(comp.date)} />
              <Detail
                label="Registration deadline"
                value={formatDate(comp.registrationDeadline)}
              />
              <Detail label="Entry fee" value={`${peso(comp.entryFee)} / fish`} />
              <Detail label="Level" value={comp.level} />
              <Detail label="Region" value={comp.region} />
            </dl>

            <div className="mt-6">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-faint">Bench capacity</span>
                <span className="font-medium tabular-nums text-muted">
                  {comp.entries.toLocaleString()} / {comp.maxEntries.toLocaleString()}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-bright"
                  style={{ width: `${Math.min(100, fillPct)}%` }}
                />
              </div>
            </div>

            {comp.status === "upcoming" && (
              <Button href="/register" className="mt-6 w-full">
                Register a Fish
              </Button>
            )}
            <Button
              href="/competitions"
              variant="outline"
              className="mt-3 w-full"
            >
              ← All competitions
            </Button>
          </Card>

          {comp.judgesPublished && comp.judges && comp.judges.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-faint">
                Official Judges
              </h3>
              <ul className="mt-3 space-y-2">
                {comp.judges.map((j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-fg">
                    <span aria-hidden>⚖️</span>
                    {j}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-faint">
              Scan to verify
            </h3>
            <div className="mt-4 flex items-center gap-4">
              <QrGlyph />
              <p className="text-xs leading-5 text-muted">
                Every entry, bench card &amp; fish carries a QR code linking back
                to its live status and passport.
              </p>
            </div>
          </Card>
        </aside>
      </Container>

      {/* Sponsors — organizer-added, doubling as advertising */}
      {(majorSponsors.length > 0 || minorSponsors.length > 0) && (
        <Container className="pb-12">
          <SectionHeading eyebrow="Proudly supported by" title="Our Sponsors" />
          {majorSponsors.length > 0 && (
            <>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Major Sponsors
              </p>
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {majorSponsors.map((s) => (
                  <Card key={s.id} className="flex items-center gap-4 p-5">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
                      {s.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.logo}
                          alt={s.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="font-display text-lg font-bold text-ink">
                          {s.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display text-lg font-bold text-fg">
                        {s.name}
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-gold">
                        Major Sponsor
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
          {minorSponsors.length > 0 && (
            <>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
                Minor Sponsors
              </p>
              <div className="flex flex-wrap gap-3">
                {minorSponsors.map((s) => (
                  <div
                    key={s.id}
                    className="inline-flex items-center gap-2.5 rounded-xl border border-line bg-surface-2 px-3 py-2"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white">
                      {s.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.logo}
                          alt={s.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs font-bold text-ink">
                          {s.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-fg">{s.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Container>
      )}

      {/* Per-show standings */}
      {standings && (
        <Container className="pb-16">
          <SectionHeading eyebrow="Show Results" title="Show Standings" />
          <div className="grid gap-6 lg:grid-cols-2">
            <RankCard title="Top 5 Players" unit="wins" rows={standings.players} />
            <RankCard title="Top 5 Teams" unit="wins" rows={standings.teams} />
            <RankCard
              title="Top 3 Handlers"
              unit="fish"
              rows={standings.handlers}
            />
            <RankCard
              title="Top 3 Breeders"
              unit="wins"
              rows={standings.breeders}
            />
          </div>

          {/* Award winners, tiered: placers → division champions → major awards */}
          <h3 className="mb-2 mt-14 font-display text-2xl font-bold tracking-tight">
            Award Winners
          </h3>
          <p className="mb-6 text-sm text-muted">
            Every winning fish with its bench code — from class placers, to
            division champions, up to the show&apos;s major awards.
          </p>

          <AwardTier
            label="Placer Awards"
            icon="🥇"
            rows={standings.placers}
          />
          <AwardTier
            label="Division Champions"
            icon="🛡️"
            rows={standings.divisionChampions}
          />
          <AwardTier
            label="Major Awards"
            icon="🏆"
            rows={standings.majorAwards}
            highlight
            judgingNow={judging.phase === "major"}
          />
        </Container>
      )}
    </>
  );
}

function AwardTier({
  label,
  icon,
  rows,
  highlight = false,
  judgingNow = false,
}: {
  label: string;
  icon: string;
  rows: { award: string; code: string; fish: string; owner: string }[];
  highlight?: boolean;
  judgingNow?: boolean;
}) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="mb-3 flex items-center gap-3">
        <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          <span>{icon}</span>
          {label}
        </h4>
        {judgingNow && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/50 bg-danger/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-danger">
            <span className="size-1.5 rounded-full bg-danger animate-live" />
            Judging now
          </span>
        )}
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-faint">{rows.length}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((a) => (
          <Card
            key={a.award + a.code}
            className={`flex items-center gap-3 p-4 ${
              highlight ? "border-gold/40 bg-gold/[0.05]" : ""
            }`}
          >
            <span className="inline-flex shrink-0 justify-center rounded-md border border-gold/40 bg-gold/10 px-2 py-1 font-mono text-sm font-bold text-gold">
              {a.code}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-semibold uppercase tracking-wide text-gold">
                {a.award}
              </div>
              <div className="truncate font-semibold text-fg">{a.fish}</div>
              <div className="truncate text-xs text-muted">{a.owner}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RankCard({
  title,
  unit,
  rows,
}: {
  title: string;
  unit: string;
  rows: ShowRankRow[];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        {title}
      </div>
      {rows.map((r, i) => (
        <div
          key={`${r.name}-${i}`}
          className="flex items-center gap-3 border-b border-line/50 px-5 py-3 last:border-0"
        >
          <RankMedal rank={i + 1} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-fg">{r.name}</div>
            <div className="truncate text-xs text-muted">{r.sub}</div>
          </div>
          <span className="font-display text-base font-bold tabular-nums text-gold">
            {r.value}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-faint">
            {unit}
          </span>
        </div>
      ))}
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-faint">{label}</dt>
      <dd className="text-right font-medium text-fg">{value}</dd>
    </div>
  );
}

function QrGlyph() {
  // Decorative QR-style glyph (not a real code).
  return (
    <div className="grid size-16 shrink-0 grid-cols-5 gap-0.5 rounded-lg border border-line bg-ink p-1.5">
      {Array.from({ length: 25 }).map((_, i) => {
        const on = [0, 1, 2, 4, 5, 9, 10, 12, 14, 15, 18, 20, 21, 22, 24].includes(i);
        return (
          <span
            key={i}
            className={`rounded-[1px] ${on ? "bg-gold" : "bg-transparent"}`}
          />
        );
      })}
    </div>
  );
}
