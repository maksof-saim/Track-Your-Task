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

const NAV_ITEMS = [
  { href: "/prayer", label: "Namaz", icon: PrayerIcon },
  { href: "/zikr", label: "Azkaar", icon: TasbihIcon },
  { href: "/tilawat", label: "Tilawat", icon: BookIcon },
  { href: "/hifazat", label: "Hifazat", icon: ShieldIcon },
  { href: "/read", label: "Read", icon: BookIcon },
];

export default function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const items = isAdmin
    ? [...NAV_ITEMS, { href: "/admin", label: "Admin", icon: UsersIcon }]
    : NAV_ITEMS;

  return (
    <>
      {/* Backdrop — mobile only, shown when drawer is open */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 sm:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[80vw] flex-col gap-1 border-r border-border bg-surface px-3 py-4 shadow-xl transition-transform duration-200 ease-out
          sm:static sm:z-auto sm:w-52 sm:max-w-none sm:translate-x-0 sm:shadow-none sm:py-4
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-3 flex items-center justify-between px-1 sm:hidden">
          <span className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-500">
              <MosqueIcon className="h-4 w-4" />
            </span>
            Menu
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Menu band karein"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-surface-muted"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-50 text-primary-600"
                  : "text-foreground/70 hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  active ? "text-primary-500" : "text-foreground/50 group-hover:text-primary-400"
                }`}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
