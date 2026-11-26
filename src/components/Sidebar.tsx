"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PrayerIcon,
  TasbihIcon,
  BookIcon,
  ShieldIcon,
  UsersIcon,
  MosqueIcon,
  CloseIcon,
} from "@/components/icons";
import { useSidebar } from "@/components/SidebarContext";
import { useI18n } from "@/lib/i18n/client";

const NAV_ITEMS = [
  { href: "/prayer", labelKey: "namaz", icon: PrayerIcon },
  { href: "/zikr", labelKey: "azkaar", icon: TasbihIcon },
  { href: "/tilawat", labelKey: "tilawat", icon: BookIcon },
  { href: "/hifazat", labelKey: "hifazat", icon: ShieldIcon },
  { href: "/read", labelKey: "read", icon: BookIcon },
] as const;

export default function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { t } = useI18n();
  const items = isAdmin
    ? [...NAV_ITEMS, { href: "/admin", labelKey: "admin", icon: UsersIcon } as const]
    : NAV_ITEMS;

  return (
    <>
      {/* Backdrop — mobile only, shown when drawer is open */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 sm:hidden ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <nav
        aria-label={t.nav.mainAria}
        className={`fixed inset-y-0 start-0 z-40 flex w-60 max-w-[70vw] flex-col gap-0.5 border-e border-border bg-surface px-2.5 py-4 shadow-xl transition-transform duration-200 ease-out
          sm:static sm:z-auto sm:w-52 sm:max-w-none sm:translate-x-0 sm:shadow-none sm:py-4 sm:gap-1
          ${isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"}`}
      >
        <div className="mb-2 flex items-center justify-between px-1 sm:hidden">
          <span className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-500">
              <MosqueIcon className="h-4 w-4" />
            </span>
            {t.nav.menu}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label={t.nav.closeMenuAria}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-surface-muted"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {items.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${active
                ? "bg-primary-50 text-primary-600"
                : "text-foreground/70 hover:bg-surface-muted hover:text-foreground"
                }`}
            >
              <Icon
                className={`h-4.5 w-4.5 shrink-0 ${active ? "text-primary-500" : "text-foreground/50 group-hover:text-primary-400"
                  }`}
              />
              <span>{t.nav[labelKey]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
