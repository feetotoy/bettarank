"use client";

import { useState } from "react";
import type { TeamMember } from "@/lib/data";
import { Card } from "@/components/ui";

/**
 * Regular team members are private. They're only revealed once the viewer is a
 * member of the team. Here we simulate membership with a local toggle; in
 * production this gate keys off the authenticated user's team membership.
 */
export function MemberGate({
  teamName,
  members,
}: {
  teamName: string;
  members: TeamMember[];
}) {
  const [isMember, setIsMember] = useState(false);

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <h2 className="font-display text-xl font-bold text-fg">Team Members</h2>
        <div className="h-px flex-1 bg-line" />
        <span className="text-sm text-faint">{members.length} members</span>
      </div>

      {isMember ? (
        <Card className="overflow-hidden">
          {members.map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-line/50 px-5 py-4 last:border-0"
            >
              <span className="flex size-10 items-center justify-center rounded-full border border-line bg-surface-2 font-display text-sm font-bold text-muted">
                {m.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <div className="font-semibold text-fg">{m.name}</div>
                <div className="text-xs text-muted">{m.role}</div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setIsMember(false)}
            className="w-full border-t border-line py-2.5 text-xs font-medium text-faint hover:text-fg"
          >
            Hide members
          </button>
        </Card>
      ) : (
        <Card className="relative overflow-hidden p-8 text-center">
          {/* Blurred teaser rows behind the lock */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 space-y-3 p-6 opacity-30 blur-sm"
          >
            {members.slice(0, 4).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="size-9 rounded-full bg-surface-3" />
                <span className="h-3 w-40 rounded bg-surface-3" />
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-line bg-surface-2 text-xl">
              🔒
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-fg">
              Members only
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
              The full roster of {teamName} is visible to team members only. Join
              the team to see all {members.length} members.
            </p>
            <button
              type="button"
              onClick={() => setIsMember(true)}
              className="mt-5 inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-sm font-semibold text-fg transition-colors hover:border-gold/50 hover:text-gold"
            >
              I&apos;m a member — view roster
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
