import { MosqueIcon } from "@/components/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-primary-700 px-4 py-10">
      <div className="mb-6 flex flex-col items-center gap-2 text-white">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-gold-400">
          <MosqueIcon className="h-8 w-8" />
        </span>
        <h1 className="text-xl font-semibold tracking-wide">Track Your Task</h1>
        <p className="text-sm text-white/70">Namaz &amp; Zikr Tracker</p>
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl sm:p-8">
        {children}
      </div>
    </div>
  );
}
