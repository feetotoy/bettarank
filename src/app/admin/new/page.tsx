import type { Metadata } from "next";
import { Container, Card, Button } from "@/components/ui";
import { CompetitionForm } from "./competition-form";

export const metadata: Metadata = {
  title: "Create Competition",
  description: "Set up a new sanctioned betta competition.",
};

export default function NewCompetitionPage() {
  return (
    <Container className="py-12">
      <Button href="/admin" variant="ghost" className="mb-4 px-0">
        ← Organizer console
      </Button>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
        Organizer Console
      </p>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Create a Competition
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Configure your event. Once submitted for federation approval, it appears
        in the public calendar and opens for registration.
      </p>

      <Card className="mt-8 p-7">
        <CompetitionForm />
      </Card>
    </Container>
  );
}
