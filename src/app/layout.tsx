import type { Metadata, Viewport } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LanguageProvider } from "@/components/language-provider";
import { getLocale } from "@/lib/i18n-server";

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050b1c",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://finoy.pet",
  ),
  title: {
    default: "FINOY — National Betta Competition & Ranking Authority",
    template: "%s · FINOY",
  },
  description:
    "The official Philippine platform for betta competition management, digital judging, fish passports, and national rankings.",
  keywords: [
    "betta",
    "betta fish competition",
    "Philippines",
    "national rankings",
    "championships",
    "fish passport",
  ],
  openGraph: {
    title: "FINOY",
    description:
      "The official Philippine national betta competition and ranking authority.",
    type: "website",
    locale: "en_PH",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale === "fil" ? "fil" : "en"}
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="bg-arena flex min-h-full flex-col">
        <LanguageProvider initialLocale={locale}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
