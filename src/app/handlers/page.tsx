import type { Metadata } from "next";
import { handlerRankings } from "@/lib/data";
import { Container, Card, Button, SectionHeading, RankMedal } from "@/components/ui";
import { SocialLinks } from "@/components/social-links";
import { HandlerRegister } from "./handler-register";

export const metadata: Metadata = {
  title: "For Handlers",
  description:
    "Handler (Joki) tools on FINOY — manage assigned fish, bench in/out by QR, print labels, and climb the handler rankings.",
};

const TOOLS = [
  { icon: "🐟", t: "Assigned fish", d: "Every fish under your care in one dashboard." },
  { icon: "📷", t: "QR bench in / out", d: "Scan to check fish in and out of the bench instantly." },
  { icon: "🏷️", t: "One-tap labels", d: "Print bench, entry & fish labels to thermal or A4." },
  { icon: "📡", t: "Live status", d: "Track judging progress and results in real-time." },
];

export default function HandlersPage() {
  return (
    <Container className="py-14">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Handler Tools
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          For Handlers (Joki)
        </h1>
        <p className="mt-3 text-muted">
          The professionals who bench the champions. Manage fish, move the bench,
          and earn your own national ranking based on results &amp; accuracy.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href="/handlers/me">Open my dashboard →</Button>
          <Button href="/track" variant="outline">
            Track a fish
          </Button>
        </div>
      </div>

      <div className="mt-10">
        <HandlerRegister />
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((t) => (
          <Card key={t.t} className="p-6">
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-xl">
              {t.icon}
            </div>
            <h3 className="font-display text-base font-bold text-fg">{t.t}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted">{t.d}</p>
          </Card>
        ))}
      </div>

      <div className="mt-14">
        <SectionHeading
          eyebrow="Leaderboard"
          title="Top Handlers"
          action={
            <Button href="/rankings" variant="ghost">
              Full rankings →
            </Button>
          }
        />
        <Card className="overflow-hidden">
          {handlerRankings.map((h, i) => (
            <div
              key={h.id}
              className="flex items-center gap-4 border-b border-line/50 px-6 py-4 last:border-0"
            >
              <RankMedal rank={i + 1} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-fg">“{h.alias}”</div>
                <div className="truncate text-xs text-muted">
                  {h.name} · {h.region} · {h.fishHandled} fish handled
                </div>
                <SocialLinks
                  socials={h.socials}
                  size="sm"
                  className="mt-1.5"
                />
              </div>
              <span className="font-display text-base font-bold tabular-nums text-gold">
                {h.benchAccuracy}%
              </span>
            </div>
          ))}
        </Card>
      </div>

      <div className="mt-12">
        <Button href="/login">Handler login</Button>
      </div>
    </Container>
  );
}
