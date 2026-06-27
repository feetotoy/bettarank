"use client";

import { useState } from "react";
import type {
  DivisionResult,
  JudgingNow,
  EntryStatus,
  ClassEntryResult,
} from "@/lib/data";

/**
 * Player-facing results, grouped by Division → Class. Codes only (no names, no
 * scores). Each entry shows a status remark — placement, OUT, or Reclassed — so
 * players can quickly find their fish code and see exactly where it stands.
 */
export function ResultsBrowser({
  divisions,
  judging,
}: {
  divisions: DivisionResult[];
  judging: JudgingNow;
}) {
  const [open, setOpen] = useState(
    judging.divisionName ?? divisions[0]?.name ?? "",
  );

  return (
    <div>
      {/* Now-judging banner */}
      <div
        className={`mb-5 flex flex-wrap items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
          judging.phase === "done"
            ? "border-line bg-surface-2/60 text-muted"
            : "border-gold/40 bg-gold/[0.06] text-fg"
        }`}
      >
        {judging.phase !== "done" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/50 bg-danger/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-danger">
            <span className="size-1.5 rounded-full bg-danger animate-live" />
            Judging now
          </span>
        )}
        <span>
          {judging.phase === "done" ? (
            judging.label
          ) : judging.phase === "major" ? (
            <>
              <span className="font-semibold text-gold">Major Awards</span> are
              being judged now.
            </>
          ) : (
            <>
              Now judging:{" "}
              <span className="font-semibold text-gold">{judging.label}</span>
            </>
          )}
        </span>
      </div>

      <p className="mb-4 text-sm text-muted">
        Open a division to check each class below it. Find your fish code and its
        status — placement, OUT, or reclassed.
      </p>

      <div className="space-y-3">
        {divisions.map((d) => {
          const isOpen = open === d.name;
          const judgingDiv =
            judging.phase === "division" && judging.divisionName === d.name;
          return (
            <div
              key={d.name}
              className="overflow-hidden rounded-2xl border border-line bg-surface/60"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? "" : d.name)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-fg">
                    {d.name}{" "}
                    <span className="text-sm font-semibold text-gold/70">
                      ({d.abbr})
                    </span>
                  </span>
                  {d.isOCV && (
                    <span className="rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                      OCV · Prince
                    </span>
                  )}
                  {judgingDiv && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/50 bg-danger/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-danger">
                      <span className="size-1.5 rounded-full bg-danger animate-live" />
                      Live
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-faint">
                  {d.classes.length} classes {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {isOpen && (
                <div className="divide-y divide-line/50 border-t border-line">
                  {d.classes.map((c) => {
                    const judgingClass =
                      judgingDiv && judging.classCode === c.classCode;
                    return (
                      <div
                        key={c.classCode}
                        className={`px-5 py-4 ${judgingClass ? "bg-gold/[0.05]" : ""}`}
                      >
                        <div className="mb-2.5 flex items-center justify-between gap-3">
                          <span className="flex flex-wrap items-baseline gap-2">
                            <span className="font-mono text-base font-bold text-gold">
                              {c.classCode}
                            </span>
                            <span className="text-sm text-muted">
                              {c.className}
                            </span>
                            {judgingClass && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-danger/50 bg-danger/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-danger">
                                <span className="size-1.5 rounded-full bg-danger animate-live" />
                                Judging
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-faint">
                            {c.entryCount}{" "}
                            {c.entryCount === 1 ? "entry" : "entries"}
                          </span>
                        </div>

                        {/* Every entry code + status remark */}
                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {c.entries.map((e) => (
                            <EntryRow key={e.code} entry={e} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<EntryStatus, string> = {
  "1st": "border-gold bg-gold/15 text-gold-bright",
  Prince: "border-gold bg-gold/15 text-gold-bright",
  "2nd": "border-silver/60 bg-silver/10 text-silver",
  "3rd": "border-bronze/60 bg-bronze/10 text-bronze",
  OUT: "border-danger/50 bg-danger/10 text-danger",
  Reclassed: "border-blue/50 bg-blue/10 text-blue-bright",
  "In class": "border-line bg-surface-2 text-faint",
};

function EntryRow({ entry }: { entry: ClassEntryResult }) {
  const placed = ["1st", "2nd", "3rd", "Prince"].includes(entry.status);
  return (
    <div
      className={`rounded-lg border px-2.5 py-1.5 ${
        placed ? "border-gold/30 bg-gold/[0.04]" : "border-line/70 bg-surface-2/40"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-bold text-fg">{entry.code}</span>
        <span
          className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[entry.status]}`}
        >
          {entry.status === "Reclassed" && entry.reclassedTo
            ? `Reclassed → ${entry.reclassedTo}`
            : entry.status}
        </span>
      </div>
      {entry.note && (
        <p className="mt-1 text-[11px] text-danger/90">📝 {entry.note}</p>
      )}
    </div>
  );
}
