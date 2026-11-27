import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import LocaleSwitch from "@/components/LocaleSwitch";

const SITE_URL = process.env.APP_URL ?? "https://track-your-amaal.vercel.app";
const TITLE = "Track Your Amaal – Salah, Dhikr & Quran Habit Tracker";
const DESCRIPTION =
  "Track your daily salah (jamaat, individual or qaza), dhikr, Quran reading and self-accountability in one simple tracker. Start in a minute.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Track Your Amaal",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: "#0b5d4b",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8963e] focus-visible:ring-offset-2";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Track Your Amaal",
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires a modern web browser",
  inLanguage: "en",
};

export default async function LandingPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).public;

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f6f3ea] pb-24 text-[#23302c] sm:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="sticky top-0 z-30 bg-[#0b5d4b] shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
          <Link
            href="/"
            aria-label={t.shell.homeAria(SITE_NAME)}
            className={`flex min-w-0 items-center gap-2 rounded-md ${focusRing}`}
          >
            <Image
              src="/icon-192.png"
              alt=""
              width={36}
              height={36}
              priority
              className="h-8 w-8 shrink-0 rounded-lg sm:h-9 sm:w-9"
            />
            <span className="truncate text-base font-bold text-white sm:text-lg">{SITE_NAME}</span>
          </Link>
          <nav aria-label={t.shell.mainAria} className="flex shrink-0 items-center gap-1 sm:gap-3">
            <Link
              href="/login"
              className={`hidden min-h-11 items-center rounded-md px-3 text-sm font-medium text-[#e3cf9a] hover:text-white min-[420px]:inline-flex ${focusRing}`}
            >
              {t.home.signIn}
            </Link>
            <LocaleSwitch />
            <Link
              href="/register"
              className={`inline-flex min-h-11 items-center rounded-md bg-[#b8963e] px-4 text-sm font-semibold text-[#062e24] hover:bg-[#c9a74f] ${focusRing}`}
            >
              {t.shell.getStarted}
            </Link>
          </nav>
        </div>
        <div className="h-1 bg-[#b8963e]" />
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-5 pt-12 pb-12 text-center sm:px-6 sm:pt-20 sm:pb-20">
          <p className="mb-3 text-xs font-semibold tracking-widest text-[#7a5f17] uppercase sm:text-sm">
            {t.home.eyebrow}
          </p>
          <h1 className="text-3xl leading-tight font-bold text-balance text-[#084538] sm:text-4xl md:text-5xl">
            {t.home.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#4a5a55] sm:mt-5 sm:text-lg sm:leading-8">
            {t.home.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className={`inline-flex min-h-12 items-center justify-center rounded-lg bg-[#0b5d4b] px-8 text-base font-semibold text-white hover:bg-[#084538] ${focusRing}`}
            >
              {t.home.createAccount}
            </Link>
            <Link
              href="/login"
              className={`inline-flex min-h-12 items-center justify-center rounded-lg border border-[#0b5d4b] px-8 text-base font-semibold text-[#0b5d4b] hover:bg-white ${focusRing}`}
            >
              {t.home.signIn}
            </Link>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
          <h2 className="mb-6 text-center text-xl font-bold text-balance text-[#084538] sm:mb-8 sm:text-2xl">
            {t.home.featuresHeading}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {t.home.features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-[#e3dcc8] border-t-4 border-t-[#b8963e] bg-white p-5 sm:p-6"
              >
                <h3 className="mb-2 text-lg font-bold text-[#0b5d4b]">{feature.title}</h3>
                <p className="text-base leading-7 text-[#4a5a55]">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-xl font-bold text-[#084538] sm:text-2xl">
              {t.home.stepsHeading}
            </h2>
            <ol className="space-y-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0">
              {t.home.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b5d4b] font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-[#0b5d4b]">{step.title}</h3>
                    <p className="text-base leading-7 text-[#4a5a55]">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
          <h2 className="mb-6 text-center text-xl font-bold text-balance text-[#084538] sm:mb-8 sm:text-2xl">
            {t.home.toolsHeading}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/tools/tasbeeh"
              className={`rounded-xl border border-[#e3dcc8] bg-white p-5 hover:border-[#b8963e] sm:p-6 ${focusRing}`}
            >
              <h3 className="mb-1 text-lg font-bold text-[#0b5d4b]">{t.home.tasbeehTitle}</h3>
              <p className="text-base leading-7 text-[#4a5a55]">{t.home.tasbeehText}</p>
            </Link>
            <Link
              href="/tools/qaza-calculator"
              className={`rounded-xl border border-[#e3dcc8] bg-white p-5 hover:border-[#b8963e] sm:p-6 ${focusRing}`}
            >
              <h3 className="mb-1 text-lg font-bold text-[#0b5d4b]">{t.home.qazaTitle}</h3>
              <p className="text-base leading-7 text-[#4a5a55]">{t.home.qazaText}</p>
            </Link>
          </div>
        </section>
        <section className="mx-auto max-w-3xl px-5 py-12 text-center sm:px-6 sm:py-16">
          <h2 className="text-xl font-bold text-balance text-[#084538] sm:text-2xl">
            {t.home.finalHeading}
          </h2>
          <p className="mt-3 text-base leading-7 text-[#4a5a55]">{t.home.finalText}</p>
          <Link
            href="/register"
            className={`mt-6 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-lg bg-[#0b5d4b] px-8 text-base font-semibold text-white hover:bg-[#084538] ${focusRing}`}
          >
            {t.home.getStarted}
          </Link>
        </section>
      </main>

      <footer className="bg-[#084538] px-5 py-8 text-center text-sm text-[#e3cf9a]">
        <p className="text-base font-semibold text-white">{SITE_NAME}</p>
        <p className="mt-1">{t.home.footerTagline}</p>
        <nav aria-label={t.shell.footerAria} className="mt-3 flex flex-wrap justify-center gap-x-6">
          <Link href="/login" className={`inline-flex min-h-11 items-center rounded-md hover:text-white ${focusRing}`}>
            {t.shell.signIn}
          </Link>
          <Link href="/register" className={`inline-flex min-h-11 items-center rounded-md hover:text-white ${focusRing}`}>
            {t.shell.createAccount}
          </Link>
          <Link href="/privacy" className={`inline-flex min-h-11 items-center rounded-md hover:text-white ${focusRing}`}>
            {t.shell.privacy}
          </Link>
          <Link href="/terms" className={`inline-flex min-h-11 items-center rounded-md hover:text-white ${focusRing}`}>
            {t.shell.terms}
          </Link>
          <Link href="/tools" className={`inline-flex min-h-11 items-center rounded-md hover:text-white ${focusRing}`}>
            {t.shell.tools}
          </Link>
        </nav>
        <p className="mt-3 text-xs opacity-80">{t.home.copyright(new Date().getFullYear())}</p>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e3dcc8] bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <Link
          href="/register"
          className={`inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#0b5d4b] text-base font-semibold text-white ${focusRing}`}
        >
          {t.home.createAccount}
        </Link>
      </div>
    </div>
  );
}
