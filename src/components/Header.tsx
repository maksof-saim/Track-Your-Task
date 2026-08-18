import Link from "next/link";
import { MosqueIcon } from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";

export default function Header({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-20 bg-primary-600 text-white shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400" />
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gold-400">
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
