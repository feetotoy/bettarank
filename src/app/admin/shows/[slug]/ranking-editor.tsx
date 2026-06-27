"use client";

import { useMemo, useState } from "react";
import { judgingSeed, placementsFor, type JudgingEntry } from "@/lib/data";

/**
 * Class-based live scoring. Classes come first (A1, A2 …); every entry in a
 * class gets 1st / 2nd / 3rd / OUT (OCV crowns a Prince). A fish can be
 * RECLASSED into another class — it moves there automatically. Each class's
 * 1st-place winner is then automatically eligible for its Division Champion.
 * Entries show ONLY their code — no names — to keep judging blind.
 */

interface Scored extends JudgingEntry {
  placement: string;
  reclassedFrom?: string;
  note?: string;
}

function placeStyle(place: string, places: string[]): string {
  if (place === "OUT") return "border-danger/50 bg-danger/10 text-danger";
  const i = places.indexOf(place);
  if (i === 0) return "border-gold bg-gold/15 text-gold-bright";
  if (i === 1) return "border-silver/60 bg-silver/10 text-silver";
  if (i === 2) return "border-bronze/60 bg-bronze/10 text-bronze";
  return "border-line bg-surface-2 text-faint";
}

export function RankingEditor({ slug }: { slug: string }) {
  const seed = useMemo(() => judgingSeed(slug), [slug]);

  // Stable class metadata (name + division) so reclassed entries carry it.
  const classMeta = useMemo(() => {
    const m: Record<
      string,
      { className: string; division: string; abbr: string }
    > = {};
    for (const e of seed)
      m[e.classCode] = {
        className: e.className,
        division: e.division,
        abbr: e.divisionAbbr,
      };
    return m;
  }, [seed]);

  // Classes grouped by division, in order.
  const classList = useMemo(() => {
    const byDiv: Record<string, { abbr: string; classes: string[] }> = {};
    const order: string[] = [];
    for (const e of seed) {
      if (!byDiv[e.division]) {
        byDiv[e.division] = { abbr: e.divisionAbbr, classes: [] };
        order.push(e.division);
      }
      if (!byDiv[e.division].classes.includes(e.classCode))
        byDiv[e.division].classes.push(e.classCode);
    }
    return order.map((division) => ({
      division,
      abbr: byDiv[division].abbr,
      classes: byDiv[division].classes,
    }));
  }, [seed]);

  const allClassCodes = useMemo(
    () => classList.flatMap((d) => d.classes),
    [classList],
  );

  const [entries, setEntries] = useState<Scored[]>(() =>
    seed.map((e) => ({ ...e, placement: "" })),
  );
  const [active, setActive] = useState<string>(seed[0]?.classCode ?? "");
  const [publishedClasses, setPublishedClasses] = useState<Set<string>>(
    () => new Set(),
  );
  const isPublished = (cc: string) => publishedClasses.has(cc);

  function publishClass(cc: string) {
    setPublishedClasses((prev) => new Set(prev).add(cc));
  }
  function markDirty(...classes: string[]) {
    setPublishedClasses((prev) => {
      if (!classes.some((c) => prev.has(c))) return prev;
      const next = new Set(prev);
      for (const c of classes) next.delete(c);
      return next;
    });
  }
  // A division is "done" once all its classes are published.
  const divisionPublished = (classes: string[]) =>
    classes.length > 0 && classes.every((c) => publishedClasses.has(c));

  const PLACES = placementsFor(active); // [1st|Prince, 2nd, 3rd, OUT]
  const SOLE = PLACES.slice(0, 3);
  const classEntries = entries.filter((e) => e.classCode === active);
  const countByClass = (cc: string) =>
    entries.filter((e) => e.classCode === cc).length;

  function setPlacement(id: string, place: string) {
    const target = entries.find((e) => e.id === id);
    if (!target) return;
    const cls = target.classCode;
    const next = target.placement === place ? "" : place;
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) return { ...e, placement: next };
        // Sole placements (1st/2nd/3rd) — clear any other holder in this class.
        if (
          next &&
          SOLE.includes(next) &&
          e.classCode === cls &&
          e.placement === next
        )
          return { ...e, placement: "" };
        return e;
      }),
    );
    markDirty(cls);
  }

  function reclass(id: string, targetClass: string) {
    if (!targetClass) return;
    const source = entries.find((e) => e.id === id)?.classCode;
    const meta = classMeta[targetClass];
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              reclassedFrom: e.reclassedFrom ?? e.classCode,
              classCode: targetClass,
              division: meta?.division ?? e.division,
              divisionAbbr: meta?.abbr ?? e.divisionAbbr,
              className: meta?.className ?? e.className,
              placement: "",
            }
          : e,
      ),
    );
    markDirty(...(source ? [source, targetClass] : [targetClass]));
  }

  function setNote(id: string, note: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, note } : e)),
    );
  }

  // Auto-eligible Division Champions — class 1st/Prince winners per division.
  const advancing = useMemo(() => {
    const byDiv: Record<
      string,
      { classCode: string; className: string; code: string }[]
    > = {};
    for (const e of entries) {
      if (e.placement && e.placement === placementsFor(e.classCode)[0]) {
        (byDiv[e.division] ??= []).push({
          classCode: e.classCode,
          className: e.className,
          code: e.code,
        });
      }
    }
    return classList
      .map((d) => ({
        division: d.division,
        abbr: d.abbr,
        winners: byDiv[d.division] ?? [],
      }))
      .filter((d) => d.winners.length > 0);
  }, [entries, classList]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-surface-2/60 px-4 py-2.5 text-xs text-muted">
        <span>🕶️</span>
        Blind judging — pick a class, then place each entry 1st / 2nd / 3rd or
        OUT. Reclass any fish that belongs in another class.
      </div>

      {/* Class selector, grouped by division */}
      <div className="mb-5 space-y-3">
        {classList.map((d) => {
          const allDone = divisionPublished(d.classes);
          return (
            <div key={d.division}>
              <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-faint">
                <span>
                  {d.division} <span className="text-gold/70">({d.abbr})</span>
                </span>
                {allDone && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-1.5 py-0.5 text-[9px] font-bold text-success">
                    ✓ Published
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {d.classes.map((cc) => {
                  const done = isPublished(cc);
                  const activeCc = active === cc;
                  return (
                    <button
                      key={cc}
                      type="button"
                      onClick={() => setActive(cc)}
                      title={classMeta[cc]?.className}
                      className={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                        activeCc
                          ? "border-gold bg-gold/15 text-gold"
                          : done
                            ? "border-success/50 bg-success/10 text-success"
                            : "border-line text-muted hover:border-line-strong hover:text-fg"
                      }`}
                    >
                      {done && <span className="text-[11px]">✓</span>}
                      <span className="font-mono">{cc}</span>
                      <span
                        className={`text-[11px] ${done ? "text-success/70" : "text-faint"}`}
                      >
                        {countByClass(cc)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active class */}
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold text-fg">
            Class <span className="font-mono text-gold">{active}</span>
            {classMeta[active] && (
              <span className="text-fg"> — {classMeta[active].className}</span>
            )}
          </h3>
          {classMeta[active] && (
            <p className="text-xs text-muted">
              {classMeta[active].division} ({classMeta[active].abbr})
            </p>
          )}
        </div>
        <span className="text-xs text-faint">
          {classEntries.length}{" "}
          {classEntries.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface/60">
        {classEntries.map((e) => (
          <div
            key={e.id}
            className={`border-b border-line/50 px-4 py-3.5 last:border-0 ${
              e.placement === SOLE[0] ? "bg-gold/[0.04]" : ""
            }`}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-8 min-w-16 items-center justify-center rounded-lg border px-2 text-xs font-bold ${placeStyle(
                  e.placement,
                  PLACES,
                )}`}
              >
                {e.placement || "—"}
              </span>
              <span className="font-mono text-sm font-bold tracking-wide text-fg">
                {e.code}
              </span>
              {e.reclassedFrom && (
                <span className="rounded-md border border-blue/50 bg-blue/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-bright">
                  ↩ from {e.reclassedFrom}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {PLACES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlacement(e.id, p)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    e.placement === p
                      ? placeStyle(p, PLACES)
                      : "border-line text-muted hover:border-line-strong hover:text-fg"
                  }`}
                >
                  {p}
                </button>
              ))}
              {/* Reclass */}
              <select
                value=""
                onChange={(ev) => reclass(e.id, ev.target.value)}
                className="ml-1 rounded-full border border-line-strong bg-surface-2 px-3 py-1.5 text-sm font-semibold text-fg outline-none focus:border-gold/60"
                title="Reclass this fish"
              >
                <option value="">⇄ Reclass…</option>
                {allClassCodes
                  .filter((cc) => cc !== e.classCode)
                  .map((cc) => (
                    <option key={cc} value={cc}>
                      Move to {cc}
                      {classMeta[cc] ? ` — ${classMeta[cc].className}` : ""}
                    </option>
                  ))}
              </select>
            </div>
            </div>

            {/* Note / fault — visible to players & handlers */}
            <input
              value={e.note ?? ""}
              onChange={(ev) => setNote(e.id, ev.target.value)}
              placeholder="Add a note / fault (e.g. oversized, anal fin fault) — players see this"
              className="mt-2.5 w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-fg outline-none placeholder:text-faint focus:border-gold/60"
            />
          </div>
        ))}
        {classEntries.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-faint">
            No entries in this class.
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => publishClass(active)}
          className="inline-flex h-11 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
        >
          {isPublished(active) ? `Re-publish Class ${active}` : `Publish Class ${active}`}
        </button>
        {isPublished(active) && (
          <span className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-4 py-2 text-sm font-semibold text-success">
            ✓ Class {active} published — winners pushed to live results
          </span>
        )}
      </div>

      {/* Auto-eligible Division Champions */}
      <div className="mt-10">
        <h3 className="font-display text-lg font-bold text-fg">
          Advancing to Division Champion
        </h3>
        <p className="mt-1 text-sm text-muted">
          Each class&apos;s 1st-place winner (Prince for OCV) is automatically
          eligible for its Division Champion judging.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {advancing.map((d) => (
            <div
              key={d.division}
              className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-4"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">
                {d.division} ({d.abbr})
              </div>
              <div className="mt-2 space-y-1.5">
                {d.winners.map((w) => (
                  <div
                    key={w.code}
                    className="flex items-center gap-2 rounded-md border border-line bg-surface-2 px-2 py-1 text-xs"
                  >
                    <span className="font-mono font-bold text-gold">
                      {w.code}
                    </span>
                    <span className="truncate text-muted">
                      {w.classCode} · {w.className}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {advancing.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-line py-8 text-center text-sm text-faint">
              Place a 1st in any class and its winner appears here, ready for
              Division Champion judging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
