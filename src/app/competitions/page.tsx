import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { PosterCard } from "@/components/poster-card";
import { getCompetitions } from "@/lib/db/competitions";
import { CompetitionsExplorer } from "./explorer";

export const metadata: Metadata = {
  title: "Competitions",
  description:
    "Browse sanctioned betta competitions across the Philippines — local leagues, regional opens, national meets, and the Grand Championship.",
};

export default async function CompetitionsPage() {
  const competitions = await getCompetitions();
  // Feature live events first, then the soonest upcoming ones, as portrait posters.
  const featured = [...competitions]
    .filter((c) => c.status !== "completed")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "live" ? -1 : 1;
      return a.date.localeCompare(b.date);
    })
    .slice(0, 3);

  return (
    <Container className="py-14">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Sanctioned Events
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Competition Calendar
        </h1>
        <p className="mt-3 text-muted">
          Every FINOY-sanctioned competition nationwide. Filter by level,
          region, and status to find your next bench-in.
        </p>
      </div>

      {/* Featured portrait posters */}
      {featured.length > 0 && (
        <div className="mt-12">
          <SectionHeading eyebrow="On the Marquee" title="Featured Competitions" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((comp) => (
              <PosterCard key={comp.slug} comp={comp} />
            ))}
          </div>
        </div>
      )}

      {/* Full filterable calendar */}
      <div className="mt-16">
        <SectionHeading eyebrow="All Events" title="Browse the Calendar" />
        <CompetitionsExplorer competitions={competitions} />
      </div>
    </Container>
  );
}
