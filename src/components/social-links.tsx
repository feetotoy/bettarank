import type { Socials } from "@/lib/data";

type Platform = {
  key: keyof Socials;
  label: string;
  icon: React.ReactNode;
};

const PLATFORMS: Platform[] = [
  {
    key: "facebook",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
        <path d="M13.5 21v-7h2.4l.4-2.85h-2.8V9.32c0-.82.23-1.39 1.42-1.39h1.5V5.38c-.26-.03-1.16-.11-2.2-.11-2.18 0-3.67 1.33-3.67 3.77v2.11H8.3V14h2.45v7h2.75z" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
        <path d="M16.1 3c.32 2.02 1.6 3.5 3.5 3.78v2.4c-1.27 0-2.45-.37-3.5-1.07v5.62c0 2.9-2.1 5.27-5 5.27s-5-2.37-5-5.27 2.1-5.27 5-5.27c.3 0 .6.02.88.07v2.52a2.7 2.7 0 0 0-.88-.15c-1.46 0-2.6 1.2-2.6 2.96 0 1.7 1.14 2.96 2.6 2.96 1.5 0 2.65-1.2 2.65-2.96V3h2.35z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="size-4"
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="3.8" />
        <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

/**
 * Renders the social handles a player / team / handler / breeder has linked, so
 * they're easy to reach. Only platforms with a value are shown; renders nothing
 * when there are none.
 */
export function SocialLinks({
  socials,
  className = "",
  size = "md",
}: {
  socials?: Socials;
  className?: string;
  size?: "sm" | "md";
}) {
  if (!socials) return null;
  const items = PLATFORMS.filter((p) => socials[p.key]);
  if (items.length === 0) return null;

  const box = size === "sm" ? "size-7" : "size-9";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {items.map((p) => (
        <a
          key={p.key}
          href={socials[p.key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={p.label}
          title={p.label}
          className={`inline-flex ${box} items-center justify-center rounded-full border border-line bg-surface-2 text-muted transition-colors hover:border-gold/50 hover:bg-gold/10 hover:text-gold`}
        >
          {p.icon}
        </a>
      ))}
    </div>
  );
}
