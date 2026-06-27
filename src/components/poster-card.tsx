import Link from "next/link";
import type { Competition } from "@/lib/data";
import { formatDate, peso } from "@/lib/data";
import { BrandLogo } from "./logo";
import { LevelBadge, StatusBadge } from "./ui";

/**
 * Portrait event poster card — the featured, aesthetic presentation of a
 * competition. Uses the organizer-uploaded poster image when present, otherwise
 * renders a premium generated poster (gradient + emblem + Philippine sun glow).
 */
export function PosterCard({ comp }: { comp: Competition }) {
  return (
    <Link
      href={`/competitions/${comp.slug}`}
      className="group relative block overflow-hidden rounded-3xl border border-line transition-colors hover:border-gold/40"
    >
      <div className={`relative aspect-[3/4] bg-gradient-to-br ${comp.poster}`}>
        {comp.posterImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={comp.posterImage}
            alt={comp.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <GeneratedPoster />
        )}

        {/* Legibility scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />

        {/* Top badges */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <LevelBadge level={comp.level} />
          <StatusBadge status={comp.status} />
        </div>

        {/* Bottom info */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-gold">
            {comp.name}
          </h3>
          <p className="mt-1 text-sm text-white/70">
            {comp.venue} · {comp.city}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-white/90 backdrop-blur-sm">
              📅 {formatDate(comp.date)}
            </span>
            <span className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-white/90 backdrop-blur-sm">
              {peso(comp.entryFee)} entry
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function GeneratedPoster() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(75%_45%_at_50%_5%,rgba(243,198,19,0.28),transparent)]" />
      {/* Centerpiece brand lockup */}
      <div className="absolute inset-x-0 top-[26%] px-8 text-center">
        <BrandLogo className="mx-auto h-24 w-auto opacity-95 drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]" />
        <div className="mx-auto mt-4 h-px w-16 divider-gold" />
      </div>
    </div>
  );
}
