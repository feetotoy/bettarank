"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { getDict, type Dict, type Locale } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  t: Dict;
  setLocale: (l: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Wraps the app (in the root layout). Seeded with the server-read locale so
 * there's no hydration mismatch. Switching writes the `locale` cookie and calls
 * `router.refresh()` so Server Components re-render in the new language too.
 */
export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l);
      document.cookie = `locale=${l}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    },
    [router],
  );

  return (
    <LanguageContext.Provider value={{ locale, t: getDict(locale), setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

/** EN | FIL pill switch for the header. */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  return (
    <div
      className={`inline-flex items-center rounded-full border border-line p-0.5 text-xs font-semibold ${className}`}
      role="group"
      aria-label="Language"
    >
      {(["en", "fil"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            locale === l ? "bg-gold text-ink" : "text-muted hover:text-fg"
          }`}
        >
          {l === "en" ? "EN" : "FIL"}
        </button>
      ))}
    </div>
  );
}
