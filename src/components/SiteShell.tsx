import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import LocaleSwitch from "@/components/LocaleSwitch";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8963e] focus-visible:ring-offset-2";

export default async function SiteShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const t = getDictionary(await getLocale()).public.shell;

  const footerLinks = [
    { href: "/", label: t.home },
    { href: "/tools", label: t.tools },
    { href: "/privacy", label: t.privacy },
    { href: "/terms", label: t.terms },
    { href: "/login", label: t.signIn },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f6f3ea] text-[#23302c]">
      <header className="sticky top-0 z-30 bg-[#0b5d4b] shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
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
            <span className="hidden truncate text-base font-bold text-white sm:inline">
              {SITE_NAME}
            </span>
          </Link>
          <nav aria-label={t.mainAria} className="flex shrink-0 items-center gap-1 sm:gap-3">
            <Link
              href="/tools"
              className={`hidden min-h-11 items-center rounded-md px-3 text-sm font-medium text-[#e3cf9a] hover:text-white min-[420px]:inline-flex ${focusRing}`}
            >
              {t.tools}
            </Link>
            <LocaleSwitch />
            <Link
              href="/register"
              className={`inline-flex min-h-11 items-center rounded-md bg-[#b8963e] px-4 text-sm font-semibold text-[#062e24] hover:bg-[#c9a74f] ${focusRing}`}
            >
              {t.getStarted}
            </Link>
          </nav>
        </div>
        <div className="h-1 bg-[#b8963e]" />
      </header>

      <main className={`mx-auto px-5 py-8 sm:px-6 sm:py-12 ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
        {children}
      </main>

      <footer className="bg-[#084538] px-5 py-8 text-center text-sm text-[#e3cf9a]">
        <p className="text-base font-semibold text-white">{SITE_NAME}</p>
        <nav aria-label={t.footerAria} className="mt-3 flex flex-wrap justify-center gap-x-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex min-h-11 items-center rounded-md hover:text-white ${focusRing}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
