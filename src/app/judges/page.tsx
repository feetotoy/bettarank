import type { Metadata } from "next";
import { Container, Card, Button, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Judges",
  description:
    "Digital judging on FINOY — score across five criteria on any tablet, finalize, and rankings compute instantly.",
};

const CRITERIA = [
  { t: "Body Structure", max: 20, d: "Form, proportion, and skeletal alignment." },
  { t: "Finnage", max: 20, d: "Spread, edge, and symmetry of fins." },
  { t: "Color", max: 20, d: "Saturation, clarity, and pattern." },
  { t: "Condition", max: 20, d: "Health, vigor, and presentation." },
  { t: "Overall Impression", max: 20, d: "The judge's holistic verdict." },
];

export default function JudgesPage() {
  return (
    <Container className="py-14">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Digital Judging
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          For Judges
        </h1>
        <p className="mt-3 text-muted">
          Score on any tablet or phone. A fish totals 100 points across five
          weighted criteria — and the leaderboard recomputes the instant you
          finalize.
        </p>
      </div>

      <div className="mt-10">
        <SectionHeading title="The 100-point rubric" />
        <Card className="overflow-hidden">
          {CRITERIA.map((c) => (
            <div
              key={c.t}
              className="flex items-center justify-between gap-4 border-b border-line/50 px-6 py-4 last:border-0"
            >
              <div>
                <div className="font-semibold text-fg">{c.t}</div>
                <div className="text-sm text-muted">{c.d}</div>
              </div>
              <span className="font-display text-lg font-bold tabular-nums text-gold">
                /{c.max}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between bg-gold/[0.05] px-6 py-4">
            <span className="font-display font-bold text-fg">Total</span>
            <span className="font-display text-xl font-bold tabular-nums text-gold">
              /100
            </span>
          </div>
        </Card>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-3">
        <Button href="/login">Judge login</Button>
        <Button href="/competitions" variant="outline">
          See live results
        </Button>
      </div>
    </Container>
  );
}
