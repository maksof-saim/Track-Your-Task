import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import LocaleSwitch from "@/components/LocaleSwitch";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8963e] focus-visible:ring-offset-2";

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-bold text-[#084538]">{title}</h2>
      <div className="space-y-3 text-base leading-7 text-[#3a4a45]">{children}</div>
    </section>
  );
}

export default async function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale).public.shell;
  // The stored date is an English label; render it in the reader's language.
  const parsed = new Date(updated);
  const updatedLabel = Number.isNaN(parsed.getTime())
    ? updated
    : parsed.toLocaleDateString(locale === "ur" ? "ur-PK" : "en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f6f3ea] text-[#23302c]">
      <header className="sticky top-0 z-30 bg-[#0b5d4b] shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2.5">
          <Link
            href="/"
            aria-label={t.homeAria(SITE_NAME)}
            className={`flex min-w-0 items-center gap-2 rounded-md ${focusRing}`}
          >
            <Image
              src="/icon-192.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-lg"
            />
            <span className="truncate text-base font-bold text-white">{SITE_NAME}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <LocaleSwitch />
            <Link
              href="/login"
              className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-[#e3cf9a] hover:text-white ${focusRing}`}
            >
              {t.signIn}
            </Link>
          </div>
        </div>
        <div className="h-1 bg-[#b8963e]" />
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl leading-tight font-bold text-[#084538] sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-[#66726d]">{t.lastUpdated(updatedLabel)}</p>
        {children}
      </main>

      <footer className="bg-[#084538] px-5 py-8 text-center text-sm text-[#e3cf9a]">
        <p className="text-base font-semibold text-white">{SITE_NAME}</p>
        <nav aria-label={t.footerAria} className="mt-3 flex flex-wrap justify-center gap-x-6">
          <Link href="/" className={`inline-flex min-h-11 items-center rounded-md hover:text-white ${focusRing}`}>
            {t.home}
          </Link>
          <Link href="/privacy" className={`inline-flex min-h-11 items-center rounded-md hover:text-white ${focusRing}`}>
            {t.privacy}
          </Link>
          <Link href="/terms" className={`inline-flex min-h-11 items-center rounded-md hover:text-white ${focusRing}`}>
            {t.terms}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
