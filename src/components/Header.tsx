"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MosqueIcon, MenuIcon } from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";
import { useSidebar } from "@/components/SidebarContext";
import { saveLocale, useI18n } from "@/lib/i18n/client";
import { LOCALE_LABELS } from "@/lib/i18n/config";

export default function Header({ userName }: { userName: string }) {
  const { toggle } = useSidebar();
  const { t, locale } = useI18n();
  const router = useRouter();
  const nextLocale = locale === "ur" ? "en" : "ur";

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary-600 text-white shadow-md sm:sticky sm:z-20 sm:shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400" />
      <div className="flex min-h-14 items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-3">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={toggle}
            aria-label={t.header.menuAria}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 sm:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex min-w-0 items-center">
            <img
              src="/logo-horizontal-white.png"
              alt="Track Your Amaal"
              className="h-9 w-auto shrink-0"
            />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-sm text-white/85 sm:inline">
            {t.header.greeting}, {userName}
          </span>
          <button
            type="button"
            onClick={() => {
              void saveLocale(nextLocale);
              router.refresh();
            }}
            aria-label={LOCALE_LABELS[nextLocale]}
            title={LOCALE_LABELS[nextLocale]}
            lang={nextLocale}
            className="flex h-9 min-w-11 shrink-0 items-center justify-center rounded-full border border-white/35 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
          >
            {LOCALE_LABELS[nextLocale]}
          </button>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
