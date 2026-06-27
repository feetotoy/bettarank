import type { Metadata } from "next";
import { platformStats, compactNumber } from "@/lib/data";
import { Container, Card, Button, SectionHeading } from "@/components/ui";
import { BrandLogo } from "@/components/logo";

export const metadata: Metadata = {
  title: "What is FINOY?",
  description:
    "FINOY — Filipino Integrated Network for Ornamental Fish Yielding Excellence. More than a name. More than a logo. A movement uniting every Filipino fishkeeper, club, and organizer under one national platform.",
};

// The brand emblems and what each stands for.
const MARKS = [
  {
    icon: "★★★",
    title: "The Three Stars",
    body: "Luzon, Visayas & Mindanao. Our islands may be separated by seas, but our passion knows no boundaries — every participant belongs to the same family.",
  },
  {
    icon: "🏆",
    title: "The Golden Trophy",
    body: "Competition, excellence, integrity, achievement. Every registration, every fish benched, every score recorded begins with fairness, transparency, and professionalism.",
  },
  {
    icon: "🌅",
    title: "The Rising Sun",
    body: "Hope, progress, a new beginning. A future where every event is faster, smarter, and more transparent — a new dawn for Philippine ornamental fishkeeping.",
  },
];

const FOR_FISHKEEPERS = [
  "Register fish online",
  "Join competitions anywhere in the country",
  "Track rankings and achievements",
  "Build a recognized breeder profile",
  "Connect with fellow hobbyists",
];

const FOR_ORGANIZERS = [
  "Online registration & payment management",
  "Benching and fish catalog management",
  "Digital judging and scoring",
  "Automated results generation",
  "National rankings & point systems",
  "Real-time announcements",
];

export default function AboutPage() {
  return (
    <>
      {/* ---------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_-10%,rgba(243,198,19,0.14),transparent)]" />
        <Container className="relative py-16 text-center sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <BrandLogo className="h-24 w-auto sm:h-32 lg:h-40" />
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-muted">
              {[
                { lead: "F", rest: "ilipino" },
                { lead: "I", rest: "ntegrated" },
                { lead: "N", rest: "etwork" },
                { lead: null, rest: "for" },
                { lead: "O", rest: "rnamental" },
                { lead: null, rest: "Fish" },
                { lead: "Y", rest: "ielding" },
                { lead: null, rest: "Excellence" },
              ].map((w, i) => (
                <span key={i}>
                  {i > 0 ? " " : ""}
                  {w.lead && (
                    <span className="text-sm font-extrabold text-gold-bright">
                      {w.lead}
                    </span>
                  )}
                  {w.rest}
                </span>
              ))}
            </p>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              More than a name. More than a logo.
              <br />
              <span className="text-gradient-gold">A movement.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted">
              Every great community begins with an invitation. In Filipino
              streets, one word has always brought people together —{" "}
              <span className="font-semibold text-fg">“Oy!”</span> A call that
              catches your attention. A friendly way of saying,{" "}
              <span className="italic text-fg">“Halika! Join us.”</span> That
              spirit lives inside FINOY.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button href="/register">Register a Fish</Button>
              <Button href="/competitions" variant="outline">
                Explore Competitions
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-16">
        {/* ----------------------------------------------- WHY FINOY (FIN/OY) */}
        <SectionHeading eyebrow="Why FINOY?" title="Built from two meaningful ideas" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="relative overflow-hidden p-7">
            <div className="absolute inset-x-0 top-0 h-1 divider-gold" />
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-extrabold text-gradient-gold">
                FIN
              </span>
              <span className="text-sm font-medium text-faint">
                every fin that glides
              </span>
            </div>
            <p className="mt-4 leading-7 text-muted">
              Every breeder, hobbyist, exhibitor, judge, club, and organizer who
              shares the passion for ornamental fish. It is also our vision —{" "}
              <span className="text-fg">
                a nationwide network designed to elevate the standards of
                ornamental fishkeeping in the Philippines.
              </span>
            </p>
          </Card>

          <Card className="relative overflow-hidden p-7">
            <div className="absolute inset-x-0 top-0 h-1 divider-gold" />
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-extrabold text-gradient-gold">
                OY
              </span>
              <span className="text-sm font-medium text-faint">
                not a shout — an invitation
              </span>
            </div>
            <p className="mt-4 leading-7 text-muted">
              An invitation for everyone to discover the hobby, join
              competitions, learn from fellow enthusiasts, and belong. Whether
              you&apos;re buying your very first fish or you&apos;re a Grand
              Champion breeder, FINOY welcomes you — because every great
              fishkeeper started with someone saying,{" "}
              <span className="italic text-fg">“Oy, try mo ’to.”</span>
            </p>
          </Card>
        </div>

        {/* ----------------------------------------------------- THE EMBLEMS */}
        <div className="mt-16">
          <SectionHeading
            eyebrow="The Logo"
            title="What every mark stands for"
          />
          <div className="grid gap-5 sm:grid-cols-3">
            {MARKS.map((m) => (
              <Card key={m.title} className="p-7 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-2xl tracking-tighter text-gold">
                  {m.icon}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-fg">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{m.body}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* ----------------------------------------- WHAT THE PLATFORM IS FOR */}
        <div className="mt-16">
          <SectionHeading
            eyebrow="One platform"
            title="Built for fishkeepers. Designed for organizers."
          />
          <p className="-mt-4 mb-8 max-w-3xl text-muted">
            FINOY isn&apos;t just another registration website. It is the
            country&apos;s first unified ecosystem built specifically for the
            ornamental fish community — one platform for every competition,
            every participant, and every organizer.
          </p>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-7">
              <h3 className="font-display text-lg font-bold text-gold">
                For fishkeepers
              </h3>
              <ul className="mt-4 space-y-3">
                {FOR_FISHKEEPERS.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted">
                    <span className="mt-0.5 text-gold">✦</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-7">
              <h3 className="font-display text-lg font-bold text-gold">
                For organizers
              </h3>
              <ul className="mt-4 space-y-3">
                {FOR_ORGANIZERS.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted">
                    <span className="mt-0.5 text-gold">✦</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* -------------------------------------------------------- THE NUMBERS */}
        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {[
            { label: "Competitions", value: platformStats.competitions },
            { label: "Fish Registered", value: platformStats.fishRegistered },
            { label: "Breeders", value: platformStats.breeders },
            { label: "Titles Awarded", value: platformStats.titlesAwarded },
          ].map((s) => (
            <div key={s.label} className="bg-surface px-5 py-7 text-center">
              <div className="font-display text-2xl font-bold tabular-nums text-gold sm:text-3xl">
                {compactNumber(s.value)}
              </div>
              <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-faint">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* --------------------------------------------------- MISSION / VISION */}
        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          <Card className="p-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Our Mission
            </h3>
            <p className="mt-3 text-lg leading-8 text-fg">
              To unite Filipino ornamental fishkeepers through technology,
              standardize competitions nationwide, empower organizers with
              world-class tools, and create one trusted platform where passion,
              competition, and community flourish together.
            </p>
          </Card>
          <Card className="p-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Our Vision
            </h3>
            <p className="mt-3 text-lg leading-8 text-fg">
              To become the official digital home of ornamental fish
              competitions in the Philippines — connecting every fishkeeper,
              every organizer, every club, and every champion through one
              unified national platform.
            </p>
          </Card>
        </div>

        {/* -------------------------------------------------------- CLOSING */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-gold/30 bg-gold/[0.05] px-6 py-14 text-center">
          <BrandLogo className="mx-auto h-16 w-auto sm:h-20" />
          <div className="mx-auto mt-6 max-w-xl space-y-1 font-display text-xl font-bold tracking-tight sm:text-2xl">
            <p>Where Every Fin Has a Story.</p>
            <p>Where Every Fishkeeper Has a Home.</p>
            <p className="text-gradient-gold">Where Every Competition Begins.</p>
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
            One Nation · One Community · One Platform
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/register">Join FINOY</Button>
            <Button href="/rankings" variant="outline">
              View National Rankings
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
