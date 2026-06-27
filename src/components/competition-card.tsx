import Link from "next/link";
import {
  type Competition,
  formatDate,
  peso,
} from "@/lib/data";
import { Card, LevelBadge, StatusBadge, Pill } from "./ui";

export function CompetitionCard({ comp }: { comp: Competition }) {
  const fillPct = Math.round((comp.entries / comp.maxEntries) * 100);
  return (
    <Card as="article" className="group overflow-hidden transition-colors hover:border-line-strong">
      <Link href={`/competitions/${comp.slug}`} className="block">
        <div
          className={`relative h-28 bg-gradient-to-br ${comp.poster} flex items-end p-4`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(243,198,19,0.18),transparent)]" />
          <div className="relative flex w-full items-center justify-between">
            <LevelBadge level={comp.level} />
            <StatusBadge status={comp.status} />
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-display text-base font-bold leading-snug text-fg transition-colors group-hover:text-gold">
            {comp.name}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {comp.venue} · {comp.city}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
            <Pill>📅 {formatDate(comp.date)}</Pill>
            <Pill>{peso(comp.entryFee)} entry</Pill>
            <Pill>{comp.categories.length} categories</Pill>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-faint">Entries</span>
              <span className="font-medium tabular-nums text-muted">
                {comp.entries.toLocaleString()} / {comp.maxEntries.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-bright"
                style={{ width: `${Math.min(100, fillPct)}%` }}
              />
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
