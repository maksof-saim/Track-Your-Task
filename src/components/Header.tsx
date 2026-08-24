"use client";

import Link from "next/link";
import { MosqueIcon, MenuIcon } from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";
import { useSidebar } from "@/components/SidebarContext";

export default function Header({ userName }: { userName: string }) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-20 bg-primary-600 text-white shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400" />
      <div className="flex items-center justify-between px-3 py-3 sm:px-6">
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={toggle}
            aria-label="Menu kholein"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 sm:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold-400">
              <MosqueIcon className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-semibold tracking-wide">
                Track Your Task
              </span>
              <span className="text-[11px] text-white/70">
                Namaz &amp; Zikr Tracker
              </span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-white/85 sm:inline">
            Assalamu Alaikum, {userName}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
