"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

const REGIONS = ["Luzon", "Visayas", "Mindanao", "NCR"] as const;

interface SavedRequest {
  name: string;
  email: string;
  contact: string;
  organization?: string;
  region?: string;
  message?: string;
  submittedAt: string;
}

/**
 * Shown on /admin to any signed-in account that is not yet an Organizer.
 * Presents a pop-up style application form (organizer name, email, contact
 * number). Submitting queues the request for Super Admin approval; once
 * approved the account unlocks the full Organizer Console.
 */
export function RequestOrganizerAccess({
  email,
  demo,
}: {
  email: string | null;
  demo: boolean;
}) {
  const storageKey = `finoy-organizer-request-${email ?? "demo"}`;
  const [pending, setPending] = useState<SavedRequest | null>(null);
  const [name, setName] = useState("");
  const [emailVal, setEmailVal] = useState(email ?? "");
  const [contact, setContact] = useState("");
  const [organization, setOrganization] = useState("");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPending(JSON.parse(raw) as SavedRequest);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const valid = name.trim() && emailVal.trim() && contact.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const req: SavedRequest = {
      name: name.trim(),
      email: emailVal.trim(),
      contact: contact.trim(),
      organization: organization.trim() || undefined,
      region: region || undefined,
      message: message.trim() || undefined,
      submittedAt: new Date().toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(req));
    } catch {
      /* ignore */
    }
    setPending(req);
  }

  function withdraw() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setPending(null);
  }

  // Backdrop wrapper to give the form a focused "pop-up" feel.
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_50%_-10%,rgba(243,198,19,0.12),transparent)]" />
      <div className="mx-auto max-w-xl">
        {pending ? (
          <Card className="relative overflow-hidden p-7 text-center sm:p-9">
            <div className="absolute inset-x-0 top-0 h-1 divider-gold" />
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-2xl">
              ⏳
            </div>
            <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
              Request submitted
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Your application to become an Organizer is{" "}
              <span className="font-semibold text-gold">
                pending Super Admin approval
              </span>
              . Once approved, the full Organizer Console unlocks here — create
              competitions, manage entries, judging, and results.
            </p>

            <div className="mt-6 rounded-2xl border border-line bg-surface-2/60 p-5 text-left text-sm">
              <Detail label="Organizer name" value={pending.name} />
              <Detail label="Email" value={pending.email} />
              <Detail label="Contact number" value={pending.contact} />
              {pending.organization && (
                <Detail label="Organization" value={pending.organization} />
              )}
              {pending.region && (
                <Detail label="Region" value={pending.region} />
              )}
              <Detail label="Submitted" value={pending.submittedAt} />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-5 text-sm font-semibold text-ink"
              >
                Back to home
              </Link>
              <button
                type="button"
                onClick={withdraw}
                className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-muted transition-colors hover:border-danger/50 hover:text-danger"
              >
                Withdraw request
              </button>
            </div>
            {demo && (
              <p className="mt-4 text-xs text-faint">
                Demo — your request is saved on this device. The Super Admin sees
                a live review queue in their console.
              </p>
            )}
          </Card>
        ) : (
          <Card className="relative overflow-hidden p-7 sm:p-9">
            <div className="absolute inset-x-0 top-0 h-1 divider-gold" />
            <div className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-2xl">
                🏆
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
                Organizer Access
              </p>
              <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
                Apply to become an Organizer
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Every FINOY account starts as a regular user. To create and run
                sanctioned shows, send a quick request — the Super Admin reviews
                it and unlocks the Organizer Console for you.
              </p>
            </div>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <Field label="Organizer name" required>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="ro-input"
                  required
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  value={emailVal}
                  onChange={(e) => setEmailVal(e.target.value)}
                  placeholder="you@email.com"
                  className="ro-input"
                  required
                />
              </Field>
              <Field label="Contact number" required>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="09XX XXX XXXX"
                  className="ro-input"
                  required
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Organization / club (optional)">
                  <input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Cavite Betta Society"
                    className="ro-input"
                  />
                </Field>
                <Field label="Region (optional)">
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="ro-input"
                  >
                    <option value="">Select…</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Tell us about the shows you want to run (optional)">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="Where, how often, and what divisions you plan to host…"
                  className="ro-input resize-none"
                />
              </Field>

              <button
                type="submit"
                disabled={!valid}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold text-sm font-semibold text-ink transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit request
              </button>
              <p className="text-center text-xs text-faint">
                You&apos;ll keep your current account while the request is
                reviewed. Approval adds the Organizer role on top.
              </p>
            </form>
          </Card>
        )}
      </div>

      <style>{`
        .ro-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-line);
          background: var(--color-surface-2);
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          color: var(--color-fg);
          outline: none;
        }
        .ro-input:focus {
          border-color: rgba(243, 198, 19, 0.6);
          box-shadow: 0 0 0 3px rgba(243, 198, 19, 0.12);
        }
        .ro-input::placeholder { color: var(--color-faint); }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-faint">
        {label}
        {required && <span className="ml-1 text-gold">*</span>}
      </span>
      {children}
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/50 py-1.5 last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">
        {label}
      </span>
      <span className="text-right font-medium text-fg">{value}</span>
    </div>
  );
}
