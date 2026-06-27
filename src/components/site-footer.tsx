import Link from "next/link";
import { BrandLogo } from "./logo";
import { Container } from "./ui";

const COLUMNS = [
  {
    title: "Compete",
    links: [
      { href: "/competitions", label: "Competitions" },
      { href: "/register", label: "Register a Fish" },
      { href: "/competitions?status=live", label: "Live Results" },
    ],
  },
  {
    title: "Rankings",
    links: [
      { href: "/rankings?type=players", label: "Player Rankings" },
      { href: "/rankings?type=breeders", label: "Breeder Rankings" },
      { href: "/teams", label: "Teams Directory" },
      { href: "/hall-of-fame", label: "Hall of Fame" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/about", label: "About the Federation" },
      { href: "/admin", label: "Organizer Console" },
      { href: "/terms/organizer", label: "Organizer Terms" },
      { href: "/super-admin", label: "Super Admin" },
      { href: "/handlers", label: "For Handlers" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/70 bg-surface/40">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center">
              <BrandLogo className="h-10 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
              Born Pinoy. Built for fishkeepers. Finoy is the official home of
              Philippine ornamental fish competition and ranking — from local
              clubs to the Grand Championship.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-faint">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/70 pt-6 text-xs text-faint sm:flex-row">
          <p>© 2026 FINOY Federation. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-success animate-live" />
            National rankings synced in real-time
          </p>
        </div>
      </Container>
    </footer>
  );
}
