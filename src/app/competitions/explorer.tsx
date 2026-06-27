"use client";

import { useMemo, useState } from "react";
import type { Competition, CompetitionLevel, Region } from "@/lib/data";
import { CompetitionCard } from "@/components/competition-card";

const LEVELS: (CompetitionLevel | "All")[] = [
  "All",
  "Local",
  "Regional",
  "National",
  "Grand Championship",
];
const REGIONS: (Region | "All")[] = ["All", "NCR", "Luzon", "Visayas", "Mindanao"];
const STATUSES = ["All", "live", "upcoming", "completed"] as const;

export function CompetitionsExplorer({
  competitions,
}: {
  competitions: Competition[];
}) {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");

  const filtered = useMemo(
    () =>
      competitions.filter(
        (c) =>
          (level === "All" || c.level === level) &&
          (region === "All" || c.region === region) &&
          (status === "All" || c.status === status),
      ),
    [competitions, level, region, status],
  );

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <FilterGroup
          label="Level"
          options={LEVELS}
          value={level}
          onChange={setLevel}
        />
        <FilterGroup
          label="Region"
          options={REGIONS}
          value={region}
          onChange={setRegion}
        />
        <FilterGroup
          label="Status"
          options={STATUSES}
          value={status}
          onChange={setStatus}
          format={(s) => (s === "All" ? "All" : s[0].toUpperCase() + s.slice(1))}
        />
      </div>

      <p className="mb-6 mt-5 text-sm text-faint">
        {filtered.length} competition{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((comp) => (
            <CompetitionCard key={comp.slug} comp={comp} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center text-muted">
          No competitions match these filters.
        </div>
      )}
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  format = (s) => s,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-faint">
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            value === opt
              ? "border-gold/60 bg-gold/10 text-gold"
              : "border-line text-muted hover:border-line-strong hover:text-fg"
          }`}
        >
          {format(opt)}
        </button>
      ))}
    </div>
  );
}
