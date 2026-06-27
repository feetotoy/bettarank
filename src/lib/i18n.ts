/**
 * Lightweight i18n for FINOY. The active locale is stored in a `locale` cookie
 * so both Server Components (read it via `getLocale()`) and Client Components
 * (the `LanguageProvider`) agree. Add keys to the `Dict` interface + both
 * dictionaries to translate more of the app incrementally.
 */

export type Locale = "en" | "fil";
export const LOCALES: Locale[] = ["en", "fil"];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "fil";
}

export interface Dict {
  lang: { label: string; en: string; fil: string };
  nav: {
    about: string;
    competitions: string;
    rankings: string;
    teams: string;
    track: string;
    hallOfFame: string;
  };
  header: { organizer: string; login: string; register: string };
  hero: {
    badge: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    halika: string;
    explore: string;
    rankings: string;
    whatIs: string;
  };
}

export const dictionaries: Record<Locale, Dict> = {
  en: {
    lang: { label: "Language", en: "English", fil: "Filipino" },
    nav: {
      about: "About",
      competitions: "Competitions",
      rankings: "Rankings",
      teams: "Teams",
      track: "Track Fish",
      hallOfFame: "Hall of Fame",
    },
    header: { organizer: "Organizer", login: "Log in", register: "Register Fish" },
    hero: {
      badge: "Official National Ranking Authority",
      titleA: "The Premier League of",
      titleB: "Philippine Ornamental Fish",
      subtitle:
        "More than a name — a movement. From your very first betta to a Grand Champion bloodline, FINOY unites every Filipino fishkeeper across Luzon, Visayas & Mindanao under one national standard for competition, judging, and rankings.",
      halika: "Halika, join us.",
      explore: "Explore Competitions",
      rankings: "View National Rankings",
      whatIs: "What is FINOY? →",
    },
  },
  fil: {
    lang: { label: "Wika", en: "Ingles", fil: "Filipino" },
    nav: {
      about: "Tungkol",
      competitions: "Mga Paligsahan",
      rankings: "Mga Ranggo",
      teams: "Mga Koponan",
      track: "Subaybayan",
      hallOfFame: "Hall of Fame",
    },
    header: {
      organizer: "Organisador",
      login: "Mag-login",
      register: "Magparehistro",
    },
    hero: {
      badge: "Opisyal na Pambansang Awtoridad sa Ranggo",
      titleA: "Ang Pangunahing Liga ng",
      titleB: "Pang-dekorasyong Isda ng Pilipinas",
      subtitle:
        "Higit pa sa pangalan — isang kilusan. Mula sa iyong unang betta hanggang sa linya ng Grand Champion, pinag-iisa ng FINOY ang bawat Pilipinong mangingisda sa Luzon, Visayas, at Mindanao sa ilalim ng iisang pambansang pamantayan para sa paligsahan, paghuhusga, at ranggo.",
      halika: "Halika, sumali ka!",
      explore: "Tuklasin ang mga Paligsahan",
      rankings: "Tingnan ang Pambansang Ranggo",
      whatIs: "Ano ang FINOY? →",
    },
  },
};

export function getDict(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries.en;
}
