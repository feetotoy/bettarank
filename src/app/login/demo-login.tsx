"use client";

import { useRouter } from "next/navigation";
import {
  ALL_ROLES,
  ROLE_ICON,
  ROLE_LABEL,
  roleHome,
  type AppRole,
} from "@/lib/roles";
import { Card } from "@/components/ui";
import { BrandLogo } from "@/components/logo";
import { setCookie } from "@/lib/cookies";

const ROLE_BLURB: Record<AppRole, string> = {
  "super-admin": "Full control — accounts, roles, approvals.",
  organizer: "Create & run shows, scoring, payments.",
  handler: "Bench fish & track their status.",
  breeder: "Recognized on breeder rankings.",
  player: "Register fish, track entries & rankings.",
};

/**
 * Demo "Test as…" login — only shown when real Supabase auth isn't configured.
 * Picks a role, stores it in the `finoy-role` cookie, and lands on that role's
 * home. For testing/exploration only — no password, no real account.
 */
export function DemoLogin() {
  const router = useRouter();

  function actAs(role: AppRole) {
    setCookie("finoy-role", role);
    router.push(roleHome(role));
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md p-8">
      <div className="flex flex-col items-center text-center">
        <BrandLogo className="h-12 w-auto" />
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          Test as…
        </h1>
        <p className="mt-1 text-sm text-muted">
          Real sign-in isn&apos;t enabled yet. Pick a role to explore the app as
          that user — for testing only.
        </p>
      </div>

      <div className="mt-7 space-y-2.5">
        {ALL_ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => actAs(r)}
            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-3 text-left transition-colors hover:border-gold/50 hover:bg-gold/[0.05]"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-lg">
              {ROLE_ICON[r]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-fg">
                {ROLE_LABEL[r]}
              </span>
              <span className="block truncate text-xs text-muted">
                {ROLE_BLURB[r]}
              </span>
            </span>
            <span className="text-faint">→</span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-faint">
        Once Supabase Auth is configured, this is replaced by real email/password
        login and accounts.
      </p>
    </Card>
  );
}
