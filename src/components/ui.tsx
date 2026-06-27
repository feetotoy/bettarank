import Link from "next/link";
import type { ReactNode } from "react";
import { rankDelta } from "@/lib/data";

/* ------------------------------------------------------------------ */
/*  Layout primitives                                                  */
/* ------------------------------------------------------------------ */

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Surfaces                                                           */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className = "",
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
}) {
  return (
    <As
      className={`rounded-2xl border border-line bg-surface/70 backdrop-blur-sm ${className}`}
    >
      {children}
    </As>
  );
}

/* ------------------------------------------------------------------ */
/*  Badges                                                             */
/* ------------------------------------------------------------------ */

const LEVEL_STYLES: Record<string, string> = {
  Local: "border-line-strong text-muted",
  Regional: "border-sky-700/60 text-sky-300",
  National: "border-gold-deep/70 text-gold",
  "Grand Championship":
    "border-gold/70 bg-gold/10 text-gold-bright shadow-[0_0_18px_-6px_rgba(243,198,19,0.6)]",
};

export function LevelBadge({ level }: { level: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
        LEVEL_STYLES[level] ?? "border-line text-muted"
      }`}
    >
      {level}
    </span>
  );
}

export function StatusBadge({ status }: { status: "upcoming" | "live" | "completed" }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/50 bg-danger/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-danger">
        <span className="size-1.5 rounded-full bg-danger animate-live" />
        Live
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center rounded-full border border-line bg-surface-3 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-success">
      Upcoming
    </span>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Buttons                                                            */
/* ------------------------------------------------------------------ */

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
}) {
  const base =
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all";
  const styles = {
    primary:
      "bg-gradient-to-b from-gold-bright to-gold text-ink hover:shadow-[0_8px_30px_-8px_rgba(243,198,19,0.7)] hover:-translate-y-0.5",
    outline:
      "border border-line-strong text-fg hover:border-gold/60 hover:text-gold",
    ghost: "text-muted hover:text-fg",
  }[variant];
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Rank ornaments                                                     */
/* ------------------------------------------------------------------ */

export function RankMedal({ rank }: { rank: number }) {
  const styles =
    rank === 1
      ? "border-gold bg-gold/15 text-gold-bright shadow-[0_0_16px_-4px_rgba(243,198,19,0.8)]"
      : rank === 2
        ? "border-silver/60 bg-silver/10 text-silver"
        : rank === 3
          ? "border-bronze/60 bg-bronze/10 text-bronze"
          : "border-line bg-surface-2 text-muted";
  return (
    <span
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl border font-display text-sm font-bold tabular-nums ${styles}`}
    >
      {rank}
    </span>
  );
}

export function RankDelta({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  const { dir, value } = rankDelta(current, previous);
  if (dir === "same") {
    return <span className="text-[11px] font-medium text-faint">—</span>;
  }
  const up = dir === "up";
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums ${
        up ? "text-success" : "text-danger"
      }`}
    >
      {up ? "▲" : "▼"}
      {value}
    </span>
  );
}
