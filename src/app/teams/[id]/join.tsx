"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

export function JoinTeam({
  teamName,
  email,
  phone,
  recruiting,
}: {
  teamName: string;
  email: string;
  phone: string;
  recruiting: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <Card className="p-6">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-faint">
        Contact this team
      </h3>

      {recruiting ? (
        <p className="mt-2 text-sm text-success">● Currently recruiting</p>
      ) : (
        <p className="mt-2 text-sm text-faint">Roster currently full</p>
      )}

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-faint">Email</dt>
          <dd>
            <a href={`mailto:${email}`} className="font-medium text-fg hover:text-gold">
              {email}
            </a>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-faint">Phone</dt>
          <dd className="font-medium text-fg">{phone}</dd>
        </div>
      </dl>

      {!sent ? (
        <>
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={!recruiting}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {recruiting ? "Request to Join" : "Not recruiting"}
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                setOpen(false);
              }}
              className="mt-5 space-y-3"
            >
              <input
                required
                className="j-input"
                placeholder="Your name"
                aria-label="Your name"
              />
              <input
                required
                type="email"
                className="j-input"
                placeholder="Your email"
                aria-label="Your email"
              />
              <textarea
                rows={3}
                className="j-input resize-none"
                placeholder={`Tell ${teamName} about yourself and your fish...`}
                aria-label="Message"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold text-sm font-semibold text-ink"
                >
                  Send request
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-line-strong px-4 text-sm font-semibold text-fg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      ) : (
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-success/40 bg-success/10 p-4">
          <span>✅</span>
          <p className="text-sm text-fg">
            Request sent to <span className="font-semibold">{teamName}</span>.
            The captain will reach out via email. (Demo)
          </p>
        </div>
      )}

      <style>{`
        .j-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-line);
          background: var(--color-surface-2);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: var(--color-fg);
          outline: none;
        }
        .j-input:focus {
          border-color: rgba(243, 198, 19, 0.6);
          box-shadow: 0 0 0 3px rgba(243, 198, 19, 0.12);
        }
        .j-input::placeholder { color: var(--color-faint); }
      `}</style>
    </Card>
  );
}
