import type { Metadata } from "next";
import { competitions } from "@/lib/data";
import { Container } from "@/components/ui";
import { RegistrationWizard } from "./wizard";

export const metadata: Metadata = {
  title: "Register a Fish",
  description:
    "Register your betta for a sanctioned FINOY competition — a clear, guided step-by-step flow from entry to bench.",
};

export default function RegisterPage() {
  const openComps = competitions.filter((c) => c.status === "upcoming");

  return (
    <Container className="py-14">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Online Registration
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Register a Fish
        </h1>
        <p className="mt-3 text-muted">
          Follow the five guided steps below — choose a competition, add your
          class entries, confirm the player, pay, and get your sequential codes.
          No paperwork, no guesswork.
        </p>
      </div>

      <div className="mt-10">
        <RegistrationWizard competitions={openComps} />
      </div>
    </Container>
  );
}
