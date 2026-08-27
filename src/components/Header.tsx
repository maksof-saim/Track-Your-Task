"use client";

import Link from "next/link";
import { MosqueIcon, MenuIcon } from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";
import { useSidebar } from "@/components/SidebarContext";

export default function Header({ userName }: { userName: string }) {
  const { toggle } = useSidebar();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary-600 text-white shadow-md sm:sticky sm:z-20 sm:shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400" />
      <div className="flex min-h-14 items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-3">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={toggle}
            aria-label="Menu kholein"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 sm:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold-400">
              <MosqueIcon className="h-5 w-5" />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold tracking-wide sm:text-base">
                Track Your Amaal
              </span>
              <span className="truncate text-[10px] text-white/70 sm:text-[11px]">
                Amaal Tracker
              </span>
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-sm text-white/85 sm:inline">
            Assalamu Alaikum, {userName}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
