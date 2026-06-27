"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

const REGIONS = ["NCR", "Luzon", "Visayas", "Mindanao"];

export function TeamRegister() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [logo, setLogo] = useState<string | undefined>();

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Register your team</h2>
          <p className="mt-1 text-sm text-muted">
            Put your club on the national map. Recruit members, track team
            championships, and compete for Team of the Year.
          </p>
        </div>
        {!open && !submitted && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            + Register a Team
          </button>
        )}
      </div>

      {open && !submitted && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            setOpen(false);
          }}
          className="grid gap-5 border-t border-line p-6 sm:grid-cols-2"
        >
          {/* Logo upload */}
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-faint">
              Team logo
            </span>
            <div className="flex items-center gap-4">
              <label className="flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line-strong bg-surface-2 text-center text-xs text-faint transition-colors hover:border-gold/50">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
                    alt="logo preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-2">＋ Upload</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setLogo(URL.createObjectURL(file));
                  }}
                />
              </label>
              <p className="text-xs text-muted">
                Square PNG or JPG recommended. Appears in the directory and on
                your team page.
              </p>
            </div>
          </div>

          <Field label="Team name">
            <input required className="t-input" placeholder="e.g. Team Bicol Surge" />
          </Field>
          <Field label="Region">
            <select className="t-input">
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Captain name">
            <input required className="t-input" placeholder="Full name" />
          </Field>
          <Field label="Home base (city)">
            <input required className="t-input" placeholder="e.g. Legazpi City" />
          </Field>
          <Field label="Contact email">
            <input
              required
              type="email"
              className="t-input"
              placeholder="captain@team.ph"
            />
          </Field>
          <Field label="Contact number">
            <input className="t-input" placeholder="+63 9XX XXX XXXX" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="About your team">
              <textarea
                rows={3}
                className="t-input resize-none"
                placeholder="Tell competitors what your team is about, your specialties, and what you're looking for in members."
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted sm:col-span-2">
            <input type="checkbox" defaultChecked className="accent-gold" />
            Open to recruiting new members
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 text-sm font-semibold text-ink"
            >
              Submit team for approval
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-full border border-line-strong px-6 text-sm font-semibold text-fg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="border-t border-line p-6">
          <div className="flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-semibold text-fg">
                Team submitted for approval
              </p>
              <p className="mt-0.5 text-sm text-muted">
                The FINOY Super Admin will review your registration. Once
                approved, your team appears in the national directory and starts
                earning championships. (Demo — wired to the API later.)
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setLogo(undefined);
                }}
                className="mt-3 text-sm font-semibold text-gold"
              >
                Register another team
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .t-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-line);
          background: var(--color-surface-2);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--color-fg);
          outline: none;
        }
        .t-input:focus {
          border-color: rgba(243, 198, 19, 0.6);
          box-shadow: 0 0 0 3px rgba(243, 198, 19, 0.12);
        }
        .t-input::placeholder { color: var(--color-faint); }
      `}</style>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-faint">
        {label}
      </span>
      {children}
    </label>
  );
}
