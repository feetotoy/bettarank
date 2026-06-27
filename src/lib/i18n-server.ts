import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./i18n";

/**
 * Read the active locale from the `locale` cookie in Server Components, Route
 * Handlers, and the root layout. Falls back to the default locale.
 */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get("locale")?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
