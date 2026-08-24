"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PrayerIcon, TasbihIcon, BookIcon, ShieldIcon, UsersIcon } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/prayer", label: "Namaz", icon: PrayerIcon },
  { href: "/zikr", label: "Azkaar", icon: TasbihIcon },
  { href: "/tilawat", label: "Tilawat", icon: BookIcon },
  { href: "/hifazat", label: "Hifazat", icon: ShieldIcon },
  { href: "/read", label: "Read", icon: BookIcon },

];

export default function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const items = isAdmin
    ? [...NAV_ITEMS, { href: "/admin", label: "Admin", icon: UsersIcon }]
    : NAV_ITEMS;

  return (
    <nav
      aria-label="Main navigation"
      className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-border bg-surface py-4 sm:w-52 sm:items-stretch sm:px-3"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`group flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-medium transition-colors sm:flex-row sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm ${active
                ? "bg-primary-50 text-primary-600"
                : "text-foreground/70 hover:bg-surface-muted hover:text-foreground"
              }`}
          >
            <Icon
              className={`h-5 w-5 shrink-0 ${active ? "text-primary-500" : "text-foreground/50 group-hover:text-primary-400"
                }`}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
