import Link from "next/link";

export default function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-primary-700 text-white/80 sm:static">
      <div className="arabesque-divider h-1 w-full opacity-40" />
      <div className="flex flex-col items-center gap-1 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 text-center text-xs sm:flex-row sm:justify-between sm:px-6">
        <span>© {new Date().getFullYear()} Track Your Amaal — Amaal Tracker</span>
        <nav aria-label="Legal" className="flex items-center gap-4">
          <Link href="/settings" className="inline-flex min-h-10 items-center hover:text-white hover:underline">
            Account
          </Link>
          <Link href="/privacy" className="inline-flex min-h-10 items-center hover:text-white hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="inline-flex min-h-10 items-center hover:text-white hover:underline">
            Terms of Use
          </Link>
        </nav>
        <span className="text-gold-500">
          &quot;اِنَّ الصَّلٰوةَ كَانَتْ عَلَى الْمُؤْمِنِيْنَ كِتٰبًا مَّوْقُوْتًا&quot;
        </span>
      </div>
    </footer>
  );
}