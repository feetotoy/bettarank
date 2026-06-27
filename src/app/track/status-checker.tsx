"use client";

import { useState } from "react";
import {
  lookupFishStatus,
  ENTRY_STAGES,
  type FishStatus,
} from "@/lib/data";
import { Card } from "@/components/ui";

type Result = FishStatus | "none" | null;

export function StatusChecker({ initial = "" }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const [result, setResult] = useState<Result>(() =>
    initial ? lookupFishStatus(initial) ?? "none" : null,
  );

  function search() {
    if (q.trim().length < 2) return;
    setResult(lookupFishStatus(q) ?? "none");
  }

  return (
    <div>
      {/* Search */}
      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <div className="flex flex-col items-center text-center">
          <div className="relative grid size-24 grid-cols-5 gap-0.5 rounded-xl border border-gold/30 bg-ink p-2">
            {Array.from({ length: 25 }).map((_, i) => {
              const on = [0, 1, 2, 4, 5, 9, 10, 12, 14, 15, 18, 20, 21, 22, 24].includes(i);
              return (
                <span key={i} className={`rounded-[1px] ${on ? "bg-gold" : ""}`} />
              );
            })}
            <span className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 bg-danger/70 animate-live" />
          </div>
          <p className="mt-3 text-sm text-muted">
            Scan your bench sticker QR, or enter your code below.
          </p>
        </div>

        <div className="mx-auto mt-5 flex max-w-md gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="e.g. A1-0005"
            className="t-input flex-1"
            autoFocus
          />
          <button
            type="button"
            onClick={search}
            className="inline-flex h-11 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 text-sm font-semibold text-ink"
          >
            Check
          </button>
        </div>
      </div>

      {/* Result */}
      {result === "none" && (
        <Card className="mt-6 p-8 text-center">
          <div className="text-3xl">🔍</div>
          <p className="mt-3 font-semibold text-fg">No entry found</p>
          <p className="mt-1 text-sm text-muted">
            Double-check your bench code (e.g. A1-0005) and try again.
          </p>
        </Card>
      )}

      {result && result !== "none" && (
        <StatusCard status={result} />
      )}

      <style>{`
        .t-input {
          border-radius: 0.75rem;
          border: 1px solid var(--color-line);
          background: var(--color-surface-2);
          padding: 0.625rem 0.875rem;
          font-size: 0.95rem;
          color: var(--color-fg);
          outline: none;
        }
        .t-input:focus {
          border-color: rgba(243, 198, 19, 0.6);
          box-shadow: 0 0 0 3px rgba(243, 198, 19, 0.12);
        }
        .t-input::placeholder { color: var(--color-faint); }
      `}</style>
    </div>
  );
}

function StatusCard({ status }: { status: FishStatus }) {
  const { code, fish, owner, handler, category, stageIndex, completed, won, placement, awards, note } =
    status;

  return (
    <Card className="mt-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
            Bench code
          </div>
          <div className="font-display text-3xl font-extrabold text-gold">
            {code}
          </div>
          {fish ? (
            <p className="mt-1 text-sm text-muted">
              {fish}
              {category ? ` · ${category}` : ""}
              {owner ? ` · ${owner}` : ""}
            </p>
          ) : (
            <p className="mt-1 text-sm text-faint">Entry on file</p>
          )}
          {handler && (
            <p className="mt-1 text-xs text-muted">
              🤝 Handled by{" "}
              <span className="font-semibold text-fg">“{handler}”</span>
            </p>
          )}
        </div>
      </div>

      {/* Result banner */}
      <div
        className={`p-6 text-center ${
          !completed
            ? "bg-surface-2"
            : won
              ? "bg-gold/[0.06]"
              : "bg-surface-2"
        }`}
      >
        {!completed ? (
          <>
            <div className="text-4xl">⏳</div>
            <p className="mt-2 font-display text-xl font-bold text-fg">
              In progress
            </p>
            <p className="mt-1 text-sm text-muted">
              Your fish is at the{" "}
              <span className="font-semibold text-fg">
                {ENTRY_STAGES[stageIndex]}
              </span>{" "}
              stage. Results appear here once judging is finalized.
            </p>
          </>
        ) : won ? (
          <>
            <div className="text-5xl">🏆</div>
            <p className="mt-2 font-display text-2xl font-bold text-gold-bright">
              You won!
            </p>
            <p className="mt-1 text-sm text-muted">{placement}</p>
            {awards.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {awards.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold bg-gold/15 px-3 py-1 text-sm font-semibold text-gold-bright"
                  >
                    🏅 {a}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-4xl">🫧</div>
            <p className="mt-2 font-display text-xl font-bold text-fg">
              Did not place this time
            </p>
            <p className="mt-1 text-sm text-muted">
              {placement} — thanks for competing. There&apos;s always the next
              show!
            </p>
          </>
        )}

        {/* Organizer's fault note / remark */}
        {note && (
          <div className="mx-auto mt-4 max-w-sm rounded-xl border border-danger/30 bg-danger/[0.06] px-4 py-3 text-left">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-danger">
              📝 Judge&apos;s remark
            </div>
            <p className="mt-0.5 text-sm text-fg">{note}</p>
          </div>
        )}
      </div>

      {/* Stage progress */}
      <div className="border-t border-line p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
          Progress
        </div>
        <ol className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1">
          {ENTRY_STAGES.map((s, i) => {
            const done = i <= stageIndex;
            const current = i === stageIndex;
            return (
              <li key={s} className="flex items-center gap-2 sm:flex-1">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                    done
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-line bg-surface-2 text-faint"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={`text-xs ${current ? "font-semibold text-fg" : done ? "text-muted" : "text-faint"}`}
                >
                  {s}
                </span>
                {i < ENTRY_STAGES.length - 1 && (
                  <span
                    className={`hidden h-px flex-1 sm:block ${
                      i < stageIndex ? "bg-gold/50" : "bg-line"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
}
