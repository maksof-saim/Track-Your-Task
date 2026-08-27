export default function Footer() {
  return (
    <footer className="border-t border-border bg-primary-700 text-white/80">
      <div className="arabesque-divider h-1 w-full opacity-40" />
      <div className="flex flex-col items-center gap-1 px-4 py-4 text-center text-xs sm:flex-row sm:justify-between sm:px-6">
        <span>© {new Date().getFullYear()} Track Your Amaal — Amaal Tracker</span>
        <span className="text-gold-500">
          &quot;اِنَّ الصَّلٰوةَ كَانَتْ عَلَى الْمُؤْمِنِيْنَ كِتٰبًا مَّوْقُوْتًا&quot;
        </span>
      </div>
    </footer>
  );
}
