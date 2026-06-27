"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

const REGIONS = ["NCR", "Luzon", "Visayas", "Mindanao"];

export function HandlerRegister() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">
            Register as a Handler
          </h2>
          <p className="mt-1 text-sm text-muted">
            Create your handler (Joki) profile. Once registered, show organizers
            can add you as an <span className="text-fg">official handler</span>{" "}
            for their competitions.
          </p>
        </div>
        {!open && !submitted && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            + Register as Handler
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
          <Field label="Full name">
            <input required className="h-input" placeholder="e.g. Bea Hernandez" />
          </Field>
          <Field label="Handler alias (Joki name)">
            <input className="h-input" placeholder="e.g. Steady Bea" />
          </Field>
          <Field label="Region">
            <select className="h-input">
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Years of experience">
            <input type="number" min={0} className="h-input" placeholder="3" />
          </Field>
          <Field label="Specialty">
            <input className="h-input" placeholder="e.g. HMPK & Halfmoon" />
          </Field>
          <Field label="Contact number">
            <input className="h-input" placeholder="+63 9XX XXX XXXX" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Short bio">
              <textarea
                rows={3}
                className="h-input resize-none"
                placeholder="Your handling background, notable results, and the classes you work best with."
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted sm:col-span-2">
            <input type="checkbox" defaultChecked className="accent-gold" />
            Make me discoverable to organizers as available for hire
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 text-sm font-semibold text-ink"
            >
              Submit handler profile
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
              <p className="font-semibold text-fg">Handler profile created</p>
              <p className="mt-0.5 text-sm text-muted">
                You&apos;re now in the national handler pool as an{" "}
                <span className="font-semibold">applicant</span>. Organizers can
                add you as an official handler for their shows — your first
                official assignment promotes you to a verified handler. (Demo —
                wired to the API later.)
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-3 text-sm font-semibold text-gold"
              >
                Register another handler
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .h-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-line);
          background: var(--color-surface-2);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--color-fg);
          outline: none;
        }
        .h-input:focus {
          border-color: rgba(243, 198, 19, 0.6);
          box-shadow: 0 0 0 3px rgba(243, 198, 19, 0.12);
        }
        .h-input::placeholder { color: var(--color-faint); }
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
