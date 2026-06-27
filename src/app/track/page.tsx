import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { StatusChecker } from "./status-checker";

export const metadata: Metadata = {
  title: "Track Your Fish",
  description:
    "Scan your QR or enter your bench code to instantly see your fish's status — benched, judging, and whether it won or lost.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <Container className="py-14">
      <div className="mx-auto max-w-xl text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Track Your Fish
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          One scan. Instant status.
        </h1>
        <p className="mt-3 text-muted">
          Scan your bench sticker QR or type your code to see exactly where your
          fish stands — and whether it won or lost.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <StatusChecker initial={code ?? ""} />
      </div>
    </Container>
  );
}
