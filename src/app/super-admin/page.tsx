import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { superAdmin } from "@/lib/data";
import { SuperAdminConsole } from "./super-admin-console";

export const metadata: Metadata = {
  title: "Super Admin",
  description:
    "Federation-wide control — monitor all accounts and assign roles: handler, organizer, team leader, breeder.",
};

export default function SuperAdminPage() {
  return (
    <Container className="py-12">
      <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-gold/30 bg-gold/[0.06] px-4 py-2.5 text-sm text-gold">
        <span>🛡️</span>
        Signed in as <span className="font-semibold">Super Admin</span>
        <span className="text-gold/70">·</span>
        <span className="font-mono text-gold-bright">{superAdmin.email}</span>
        <span className="text-gold/70">— platform-wide control.</span>
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
        Federation Control
      </p>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Super Admin Console
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Every account is a <span className="text-fg">Player</span> by default.
        Assign extra roles — Official Handler, Organizer, Team Leader, or Breeder
        — and give Team Leaders their team.
      </p>

      <div className="mt-8">
        <SuperAdminConsole />
      </div>
    </Container>
  );
}
