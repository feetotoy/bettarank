import type { Metadata } from "next";
import { hallOfFame2026 } from "@/lib/data";
import { Container, Card, Button, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Hall of Fame",
  description:
    "The annual FINOY Hall of Fame — and the Champion's Trophy awarded to the finest players, breeders, teams, and handlers of each season.",
};

const ARCHIVE = [
  {
    year: 2025,
    entries: [
      { title: "Player of the Year", winner: "Mart Ruzzel Matudio", detail: "Kasai · Visayas" },
      { title: "Breeder of the Year", winner: "Daniel Esmalla", detail: "Kasai" },
      { title: "Team of the Year", winner: "Kasai", detail: "31 championships" },
    ],
  },
  {
    year: 2024,
    entries: [
      { title: "Player of the Year", winner: "Kate Dalaguit", detail: "Krakens PH · Mindanao" },
      { title: "Breeder of the Year", winner: "Magna Carta", detail: "Dauntless" },
      { title: "Team of the Year", winner: "Dauntless", detail: "27 championships" },
    ],
  },
];

export default function HallOfFamePage() {
  return (
    <Container className="py-14">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Legends of the Sport
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Hall of Fame
        </h1>
        <p className="mt-3 text-muted">
          Each season, FINOY enshrines the champions who defined it. A
          permanent record of excellence in Philippine ornamental fish.
        </p>
      </div>

      {/* The Prize — preview the trophy you're playing for */}
      <div className="mt-12">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-surface-2 via-surface to-ink">
          <div className="absolute inset-0 bg-[radial-gradient(60%_90%_at_72%_8%,rgba(243,198,19,0.20),transparent)]" />
          <div className="relative grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
            <div className="order-2 lg:order-1">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                The Prize
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                The FINOY Champion&apos;s Trophy
              </h2>
              <p className="mt-4 max-w-md leading-7 text-muted">
                This is what every fin is playing for. At the close of each
                season, the golden FINOY trophy goes home with the year&apos;s
                finest — Player of the Year, Breeder, Team, and beyond. Climb the
                national rankings, and it could be yours.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/competitions">Compete for it →</Button>
                <Button href="/rankings" variant="outline">
                  See who&apos;s leading
                </Button>
              </div>
            </div>

            <div className="order-1 flex justify-center lg:order-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/trophy.png"
                alt="FINOY Champion's Trophy"
                width={1086}
                height={1448}
                className="h-72 w-auto drop-shadow-[0_24px_60px_rgba(243,198,19,0.30)] sm:h-[26rem]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current season — featured */}
      <div className="mt-12">
        <SectionHeading eyebrow="Reigning Champions" title="2026 Season" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hallOfFame2026.map((entry) => (
            <Card
              key={entry.title}
              className="relative overflow-hidden p-7 text-center"
            >
              <div className="absolute inset-x-0 top-0 h-px divider-gold" />
              <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(243,198,19,0.08),transparent)]" />
              <div className="relative">
                <div className="text-5xl">{entry.icon}</div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                  {entry.title}
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-fg">
                  {entry.winner}
                </p>
                <p className="mt-1 text-sm text-muted">{entry.detail}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Archive */}
      <div className="mt-16">
        <SectionHeading eyebrow="The Archive" title="Past Seasons" />
        <div className="space-y-10">
          {ARCHIVE.map((season) => (
            <div key={season.year}>
              <div className="mb-4 flex items-center gap-4">
                <h3 className="font-display text-xl font-bold text-fg">
                  {season.year}
                </h3>
                <div className="h-px flex-1 bg-line" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {season.entries.map((e) => (
                  <Card key={e.title} className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                      {e.title}
                    </p>
                    <p className="mt-1.5 font-display text-lg font-bold text-fg">
                      {e.winner}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">{e.detail}</p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
