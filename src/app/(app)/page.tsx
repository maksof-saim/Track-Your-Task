"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PRAYERS, formatDisplayDate } from "@/lib/prayerMeta";
import { ChartIcon, PrayerIcon, TasbihIcon, BookIcon, ShieldIcon } from "@/components/icons";

type Analytics = {
  grid: { date: string; statuses: Record<string, string | null> }[];
  todayLoggedCount: number;
  totalPrayers: number;
  streak: number;
  infradiPercent: number;
  qazaCount: number;
  totalLogged: number;
  zikrToday: number;
  zikrTotal30d: number;
  tilawatToday: number;
  tilawatTarget: number;
  hifazatToday: number;
  hifazatTarget: number;
};

const CELL_STYLES: Record<string, string> = {
  JAMAAT: "bg-status-jamaat",
  INFRADI: "bg-status-infradi",
  QAZA: "bg-status-qaza",
};

export default function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-foreground/60">Aapki ibadat ka khulasa</p>
      </div>

      <div className={`mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 ${loading ? "opacity-50" : ""}`}>
        <StatCard
          icon={<PrayerIcon className="h-5 w-5" />}
          label={loading ? "..." : "Aaj ki Namaz"}
          value={data ? `${data.todayLoggedCount}/${data.totalPrayers}` : "—"}
        />
        <StatCard
          icon={<ChartIcon className="h-5 w-5" />}
          label={loading ? "..." : "Streak"}
          value={data ? `${data.streak} din` : "—"}
        />
        <StatCard
          icon={<TasbihIcon className="h-5 w-5" />}
          label={loading ? "..." : "Aaj ka Zikr"}
          value={data ? `${data.zikrToday}` : "—"}
        />
        <StatCard
          icon={<BookIcon className="h-5 w-5" />}
          label={loading ? "..." : "Aaj ki Tilawat"}
          value={data ? `${data.tilawatToday}/${data.tilawatTarget}` : "—"}
        />
        <StatCard
          icon={<ShieldIcon className="h-5 w-5" />}
          label={loading ? "..." : "Aaj ki Hifazat"}
          value={data ? `${data.hifazatToday}/${data.hifazatTarget}` : "—"}
          accent="gold"
        />
      </div>

      <div className={`mb-6 grid gap-3 sm:grid-cols-2 ${loading ? "opacity-50" : ""}`}>
        <QuickLink
          href="/prayer"
          title="Aaj ki namaz record karein"
          subtitle="Pancho waqt ki namaz update karein"
          icon={<PrayerIcon className="h-5 w-5" />}
        />
        <QuickLink
          href="/zikr"
          title="Azkaar kholein"
          subtitle="Aaj ka zikr add karein"
          icon={<TasbihIcon className="h-5 w-5" />}
        />
        <QuickLink
          href="/tilawat"
          title="Tilawat record karein"
          subtitle="Quran aur muqarrar suraton ka jaiza"
          icon={<BookIcon className="h-5 w-5" />}
        />
        <QuickLink
          href="/hifazat"
          title="Hifazat ka jaiza"
          subtitle="Nazar, kaan, zaban ki hifazat"
          icon={<ShieldIcon className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="font-medium text-foreground">Pichle 14 din</p>
          <Legend />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : data ? (
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="mb-1 grid grid-cols-[70px_repeat(14,1fr)] gap-1">
                <span />
                {data.grid.map((day) => (
                  <span
                    key={day.date}
                    className="text-center text-[10px] text-foreground/40"
                  >
                    {formatDisplayDate(day.date).slice(0, 3)}
                  </span>
                ))}
              </div>
              {PRAYERS.map((prayer) => (
                <div
                  key={prayer.key}
                  className="mb-1 grid grid-cols-[70px_repeat(14,1fr)] items-center gap-1"
                >
                  <span className="text-xs text-foreground/60">{prayer.label}</span>
                  {data.grid.map((day) => {
                    const status = day.statuses[prayer.key];
                    return (
                      <span
                        key={day.date}
                        title={`${prayer.label} · ${formatDisplayDate(day.date)} · ${status ?? "Record nahi"}`}
                        className={`h-5 rounded-sm ${status ? CELL_STYLES[status] : "bg-status-empty"}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: "primary" | "gold";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span
        className={`mb-3 inline-flex rounded-full p-2 ${accent === "gold"
          ? "bg-gold-100 text-gold-600"
          : "bg-primary-50 text-primary-500"
          }`}
      >
        {icon}
      </span>
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-xs text-foreground/50">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary-300"
    >
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-xs text-foreground/50">{subtitle}</p>
      </div>
      <span className="rounded-full bg-primary-50 p-2 text-primary-500">{icon}</span>
    </Link>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-foreground/50">
      <LegendItem colorClass="bg-status-jamaat" label="Jamaat" />
      <LegendItem colorClass="bg-status-infradi" label="Infradi" />
      <LegendItem colorClass="bg-status-qaza" label="Qaza" />
      <LegendItem colorClass="bg-status-empty" label="Khali" />
    </div>
  );
}

function LegendItem({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`h-2.5 w-2.5 rounded-sm ${colorClass}`} />
      {label}
    </span>
  );
}
