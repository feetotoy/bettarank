"use client";

import { useRef, useState } from "react";
import {
  accounts as seedAccounts,
  teamRankings,
  pendingTeams,
  ACCOUNT_ROLES,
  TEAM_ROLES,
  type AccountRole,
  type PendingTeam,
} from "@/lib/data";

type ReviewStatus = "pending" | "approved" | "rejected";

interface RosterMember {
  accountId: string;
  role: string;
}

// Editable player fields the Super Admin can change (mock — local state only).
interface AccountDetail {
  name: string;
  email: string;
  region: string;
  photo?: string;
}

const REGIONS = ["Luzon", "Visayas", "Mindanao", "NCR"];

export function SuperAdminConsole() {
  const [roles, setRoles] = useState<Record<string, AccountRole[]>>(() =>
    Object.fromEntries(seedAccounts.map((a) => [a.id, a.roles ?? []])),
  );
  const [ledTeam, setLedTeam] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      seedAccounts.filter((a) => a.ledTeam).map((a) => [a.id, a.ledTeam!]),
    ),
  );
  const [rosters, setRosters] = useState<Record<string, RosterMember[]>>({});
  const [query, setQuery] = useState("");
  const [details, setDetails] = useState<Record<string, AccountDetail>>(() =>
    Object.fromEntries(
      seedAccounts.map((a) => [
        a.id,
        { name: a.name, email: a.email, region: a.region },
      ]),
    ),
  );

  function patchDetail(id: string, patch: Partial<AccountDetail>) {
    setDetails((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  // Team registrations awaiting review (all start pending).
  const [teamReview, setTeamReview] = useState<Record<string, ReviewStatus>>(
    () => Object.fromEntries(pendingTeams.map((t) => [t.id, "pending"])),
  );
  const pendingTeamCount = pendingTeams.filter(
    (t) => (teamReview[t.id] ?? "pending") === "pending",
  ).length;

  function toggleRole(id: string, role: AccountRole) {
    const turningOn = !(roles[id] ?? []).includes(role);
    setRoles((prev) => {
      const cur = prev[id] ?? [];
      const next = cur.includes(role)
        ? cur.filter((r) => r !== role)
        : [...cur, role];
      return { ...prev, [id]: next };
    });
    // Clear the led team when the Team Leader role is removed.
    if (role === "Team Leader" && !turningOn) {
      setLedTeam((prev) => {
        if (!(id in prev)) return prev;
        const rest = { ...prev };
        delete rest[id];
        return rest;
      });
    }
  }

  const has = (id: string, role: AccountRole) =>
    (roles[id] ?? []).includes(role);

  const filtered = seedAccounts.filter((a) => {
    const d = details[a.id];
    const q = query.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q);
  });

  const count = (role: AccountRole) =>
    seedAccounts.filter((a) => (roles[a.id] ?? []).includes(role)).length;

  const leaders = seedAccounts.filter((a) => has(a.id, "Team Leader"));

  function addToRoster(team: string, accountId: string) {
    setRosters((prev) => {
      const cur = prev[team] ?? [];
      if (cur.some((m) => m.accountId === accountId)) return prev;
      return { ...prev, [team]: [...cur, { accountId, role: "Member" }] };
    });
  }
  function setRosterRole(team: string, accountId: string, role: string) {
    setRosters((prev) => ({
      ...prev,
      [team]: (prev[team] ?? []).map((m) =>
        m.accountId === accountId ? { ...m, role } : m,
      ),
    }));
  }
  function removeFromRoster(team: string, accountId: string) {
    setRosters((prev) => ({
      ...prev,
      [team]: (prev[team] ?? []).filter((m) => m.accountId !== accountId),
    }));
  }

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Accounts", value: seedAccounts.length },
          { label: "Handlers", value: count("Handler") },
          { label: "Organizers", value: count("Organizer") },
          { label: "Team Leaders", value: count("Team Leader") },
          { label: "Breeders", value: count("Breeder") },
          { label: "Pending Teams", value: pendingTeamCount },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-line bg-surface/60 p-4"
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
              {s.label}
            </div>
            <div className="mt-1 font-display text-2xl font-bold tabular-nums text-gold">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Team registrations awaiting approval */}
      <div className="mt-10">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">
            Pending team registrations
          </h2>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              pendingTeamCount > 0
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-line bg-surface-2 text-faint"
            }`}
          >
            {pendingTeamCount} awaiting review
          </span>
        </div>
        <p className="mb-4 text-sm text-muted">
          Review clubs that submitted “Register a Team.” Approving adds them to
          the national directory; rejecting notifies the captain to revise.
        </p>
        <div className="space-y-3">
          {pendingTeams.map((t) => (
            <PendingTeamCard
              key={t.id}
              team={t}
              status={teamReview[t.id] ?? "pending"}
              onSet={(s) =>
                setTeamReview((prev) => ({ ...prev, [t.id]: s }))
              }
            />
          ))}
        </div>
      </div>

      {/* Accounts */}
      <div className="mt-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">All accounts</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="sa-input w-64 max-w-full"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((a) => (
            <AccountRow
              key={a.id}
              detail={details[a.id]}
              onDetail={(p) => patchDetail(a.id, p)}
              has={(r) => has(a.id, r)}
              onToggle={(r) => toggleRole(a.id, r)}
              ledTeam={ledTeam[a.id] ?? ""}
              onLedTeam={(t) =>
                setLedTeam((prev) => ({ ...prev, [a.id]: t }))
              }
            />
          ))}
        </div>
      </div>

      {/* Team Leaders → roster privileges */}
      <div className="mt-12">
        <h2 className="font-display text-xl font-bold">Teams &amp; Leaders</h2>
        <p className="mt-1 text-sm text-muted">
          A Team Leader manages their assigned team — they can add players and
          set the top roles.
        </p>

        {leaders.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-line py-8 text-center text-sm text-faint">
            No team leaders assigned yet. Grant the{" "}
            <span className="text-gold">Team Leader</span> role above.
          </div>
        )}

        <div className="mt-4 space-y-4">
          {leaders.map((leader) => {
            const team = ledTeam[leader.id];
            const roster = (team && rosters[team]) || [];
            const addable = seedAccounts.filter(
              (a) =>
                a.id !== leader.id &&
                !roster.some((m) => m.accountId === a.id),
            );
            return (
              <div
                key={leader.id}
                className="rounded-2xl border border-line bg-surface/60 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-display text-lg font-bold text-fg">
                      {details[leader.id].name}
                    </div>
                    <div className="text-xs text-muted">
                      Team Leader{team ? ` · leads ${team}` : " · no team set"}
                    </div>
                  </div>
                  <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                    {roster.length} on roster
                  </span>
                </div>

                {!team ? (
                  <p className="mt-3 text-sm text-faint">
                    Assign a team above to unlock roster management.
                  </p>
                ) : (
                  <>
                    {/* Add player */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <select
                        className="sa-input flex-1 sm:max-w-xs"
                        value=""
                        onChange={(e) =>
                          e.target.value && addToRoster(team, e.target.value)
                        }
                      >
                        <option value="">+ Add a player to the team…</option>
                        {addable.map((a) => (
                          <option key={a.id} value={a.id}>
                            {details[a.id].name} · {details[a.id].region}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Roster */}
                    {roster.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {roster.map((m) => (
                          <div
                            key={m.accountId}
                            className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-2.5"
                          >
                            <span className="flex-1 font-semibold text-fg">
                              {details[m.accountId]?.name}
                            </span>
                            <select
                              value={m.role}
                              onChange={(e) =>
                                setRosterRole(team, m.accountId, e.target.value)
                              }
                              className="sa-input w-40"
                            >
                              {TEAM_ROLES.map((r) => (
                                <option key={r}>{r}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => removeFromRoster(team, m.accountId)}
                              className="text-faint hover:text-danger"
                              aria-label="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .sa-input {
          border-radius: 0.75rem;
          border: 1px solid var(--color-line);
          background: var(--color-surface-2);
          padding: 0.55rem 0.8rem;
          font-size: 0.875rem;
          color: var(--color-fg);
          outline: none;
        }
        .sa-input:focus {
          border-color: rgba(243, 198, 19, 0.6);
          box-shadow: 0 0 0 3px rgba(243, 198, 19, 0.12);
        }
        .sa-input::placeholder { color: var(--color-faint); }
        .btn-line-sm {
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 999px; border: 1px solid var(--color-line-strong);
          padding: 0.4rem 0.85rem; font-size: 0.8rem; font-weight: 600;
          color: var(--color-fg); white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

function PendingTeamCard({
  team,
  status,
  onSet,
}: {
  team: PendingTeam;
  status: ReviewStatus;
  onSet: (s: ReviewStatus) => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        status === "approved"
          ? "border-success/40 bg-success/[0.04]"
          : status === "rejected"
            ? "border-danger/40 bg-danger/[0.04]"
            : "border-line bg-surface/60"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-bold text-fg">
              {team.name}
            </span>
            <span className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">
              {team.region}
            </span>
            {team.recruiting && (
              <span className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-faint">
                Recruiting
              </span>
            )}
            <span className="text-xs text-faint">
              · submitted {team.submitted}
            </span>
          </div>
          <div className="mt-1.5 text-xs text-muted">
            Captain: <span className="text-fg">{team.captain}</span> ·{" "}
            {team.homeBase} · {team.email}
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted">{team.about}</p>
        </div>

        <div className="shrink-0">
          {status === "pending" ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSet("approved")}
                className="inline-flex h-9 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-4 text-xs font-semibold text-ink"
              >
                ✓ Approve
              </button>
              <button
                type="button"
                onClick={() => onSet("rejected")}
                className="inline-flex h-9 items-center rounded-full border border-line-strong px-4 text-xs font-semibold text-muted transition-colors hover:border-danger/50 hover:text-danger"
              >
                ✕ Reject
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  status === "approved"
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-danger/40 bg-danger/10 text-danger"
                }`}
              >
                {status === "approved" ? "✓ Approved" : "✕ Rejected"}
              </span>
              <button
                type="button"
                onClick={() => onSet("pending")}
                className="text-xs font-semibold text-faint hover:text-fg"
              >
                Undo
              </button>
            </div>
          )}
        </div>
      </div>

      {status === "approved" && (
        <p className="mt-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
          Added to the national directory — {team.name} can now recruit members
          and earn championships.
        </p>
      )}
      {status === "rejected" && (
        <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          Registration declined — the captain has been notified to revise and
          resubmit.
        </p>
      )}
    </div>
  );
}

function AccountRow({
  detail,
  onDetail,
  has,
  onToggle,
  ledTeam,
  onLedTeam,
}: {
  detail: AccountDetail;
  onDetail: (patch: Partial<AccountDetail>) => void;
  has: (r: AccountRole) => boolean;
  onToggle: (r: AccountRole) => void;
  ledTeam: string;
  onLedTeam: (t: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" && onDetail({ photo: reader.result });
    reader.readAsDataURL(file);
  }

  const initials = detail.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 font-display text-sm font-bold text-muted">
            {detail.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={detail.photo}
                alt={detail.name}
                className="size-full object-cover"
              />
            ) : (
              initials
            )}
          </span>
          <div>
            <div className="font-semibold text-fg">{detail.name}</div>
            <div className="text-xs text-muted">
              {detail.email} · {detail.region}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Base label */}
          <span className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">
            Player
          </span>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              editing
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-line text-muted hover:border-line-strong hover:text-fg"
            }`}
          >
            {editing ? "✓ Done" : "✎ Edit details"}
          </button>
        </div>
      </div>

      {/* Editable details (Super Admin) */}
      {editing && (
        <div className="mt-4 grid gap-3 rounded-xl border border-line bg-surface-2/50 p-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-faint">
              Full name
            </span>
            <input
              value={detail.name}
              onChange={(e) => onDetail({ name: e.target.value })}
              className="sa-input w-full"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-faint">
              Email
            </span>
            <input
              value={detail.email}
              onChange={(e) => onDetail({ email: e.target.value })}
              className="sa-input w-full"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-faint">
              Region
            </span>
            <select
              value={detail.region}
              onChange={(e) => onDetail({ region: e.target.value })}
              className="sa-input w-full"
            >
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <div className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-faint">
              Profile picture
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-line-sm"
              >
                📷 Upload photo
              </button>
              {detail.photo && (
                <button
                  type="button"
                  onClick={() => onDetail({ photo: undefined })}
                  className="text-faint hover:text-danger"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickPhoto}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Role toggles */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">
          Assign:
        </span>
        {ACCOUNT_ROLES.map((r) => {
          const on = has(r);
          return (
            <button
              key={r}
              type="button"
              onClick={() => onToggle(r)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                on
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-line text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {on ? "✓ " : "+ "}
              {r === "Handler" ? "Official Handler" : r}
            </button>
          );
        })}

        {/* Team assignment for Team Leaders */}
        {has("Team Leader") && (
          <select
            value={ledTeam}
            onChange={(e) => onLedTeam(e.target.value)}
            className="sa-input"
          >
            <option value="">Assign team…</option>
            {teamRankings.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
