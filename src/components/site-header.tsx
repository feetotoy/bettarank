"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "./logo";
import { Notifications } from "./notifications";
import { LanguageToggle, useLanguage } from "./language-provider";
import type { Dict } from "@/lib/i18n";

const NAV = [
  { href: "/about", key: "about" },
  { href: "/competitions", key: "competitions" },
  { href: "/rankings", key: "rankings" },
  { href: "/teams", key: "teams" },
  { href: "/track", key: "track" },
  { href: "/hall-of-fame", key: "hallOfFame" },
] as const satisfies { href: string; key: keyof Dict["nav"] }[];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-ink/80 backdrop-blur-xl">
      <div className="h-0.5 flag-edge" />
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <BrandLogo className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-gold"
                    : "text-muted hover:text-fg"
                }`}
              >
                {t.nav[item.key]}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Notifications />

          <div className="hidden items-center gap-3 md:flex">
            <LanguageToggle />
            <Link
              href="/admin"
              className="text-sm font-medium text-muted transition-colors hover:text-fg"
            >
              {t.header.organizer}
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-muted transition-colors hover:text-fg"
            >
              {t.header.login}
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-4 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              {t.header.register}
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-lg border border-line text-fg md:hidden"
          >
            <span className="text-lg leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line/70 bg-ink px-5 pb-5 pt-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg"
            >
              {t.nav[item.key]}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg"
          >
            {t.header.organizer}
          </Link>
          <div className="mt-3 flex items-center justify-between border-t border-line/70 px-3 pt-4">
            <span className="text-xs font-medium uppercase tracking-wide text-faint">
              {t.lang.label}
            </span>
            <LanguageToggle />
          </div>
          <div className="mt-3 flex gap-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex h-10 flex-1 items-center justify-center rounded-full border border-line-strong text-sm font-semibold"
            >
              {t.header.login}
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex h-10 flex-1 items-center justify-center rounded-full bg-gold text-sm font-semibold text-ink"
            >
              {t.header.register}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
