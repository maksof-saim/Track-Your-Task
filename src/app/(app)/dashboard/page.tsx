"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PRAYERS, formatDisplayDate, getPrayerLabel, todayISO } from "@/lib/prayerMeta";
import { ChartIcon, PrayerIcon, TasbihIcon, BookIcon, ShieldIcon } from "@/components/icons";
import { useI18n } from "@/lib/i18n/client";

type Analytics = {
  grid: { date: string; statuses: Record<string, string | null> }[];
  customPrayers: { id: string; name: string; statuses: Record<string, string | null> }[];
  todayLoggedCount: number;
  totalPrayers: number;
  infradiPercent: number;
  qazaCount: number;
  totalLogged: number;
  zikrToday: number;
  zikrKasratToday: number;
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
  DONE: "bg-status-infradi",
};

function currentStreak(grid: Analytics["grid"]): number {
  const fardPrayers = PRAYERS.filter((prayer) => !prayer.nafl);
  const isComplete = (day: Analytics["grid"][number]) =>
    fardPrayers.every((prayer) => Boolean(day.statuses[prayer.key]));

  let index = grid.length - 1;
  // Today may still be in progress, so an incomplete today does not break the streak.
  if (index >= 0 && !isComplete(grid[index])) index -= 1;

  let streak = 0;
  while (index >= 0 && isComplete(grid[index])) {
    streak += 1;
    index -= 1;
  }
  return streak;
}

function streakLabel(grid: Analytics["grid"], days: string): string {
  const streak = currentStreak(grid);
  return `${streak}${streak >= grid.length ? "+" : ""} ${days}`;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/analytics?today=${todayISO()}`)
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
        <h1 className="text-xl font-semibold text-foreground">{t.dashboard.title}</h1>
        <p className="text-sm text-foreground/60">{t.dashboard.subtitle}</p>
      </div>

      <div className={`mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 ${loading ? "opacity-50" : ""}`}>
        <StatCard
          icon={<PrayerIcon className="h-5 w-5" />}
          label={loading ? "..." : t.dashboard.todayPrayers}
          value={data ? `${data.todayLoggedCount}/${data.totalPrayers}` : "—"}
          href="/prayer"

        />
        <StatCard
          href="/zikr"
          icon={<TasbihIcon className="h-5 w-5" />}
          label={loading ? "..." : t.dashboard.todayZikr}
          value={
            data
              ? `${data.zikrToday}${data.zikrKasratToday ? ` + ${data.zikrKasratToday} ${t.dashboard.kasrat}` : ""}`
              : "—"
          }
        />
        <StatCard
          href="/tilawat"
          icon={<BookIcon className="h-5 w-5" />}
          label={loading ? "..." : t.dashboard.todayTilawat}
          value={data ? `${data.tilawatToday}/${data.tilawatTarget}` : "—"}
        />
        <StatCard
          href="/hifazat"
          icon={<ShieldIcon className="h-5 w-5" />}
          label={loading ? "..." : t.dashboard.todayHifazat}
          value={data ? `${data.hifazatToday}/${data.hifazatTarget}` : "—"}
          accent="gold"
        />
        <StatCard
          icon={<ChartIcon className="h-5 w-5" />}
          label={loading ? "..." : t.dashboard.streak}
          value={data ? streakLabel(data.grid, t.dashboard.days) : "—"}
        />
      </div>

      <div className={`mb-6 grid gap-3 sm:grid-cols-2 ${loading ? "opacity-50" : ""}`}>
        <QuickLink
          href="/prayer"
          title={t.dashboard.quick.prayersTitle}
          subtitle={t.dashboard.quick.prayersSubtitle}
          icon={<PrayerIcon className="h-5 w-5" />}
        />
        <QuickLink
          href="/zikr"
          title={t.dashboard.quick.zikrTitle}
          subtitle={t.dashboard.quick.zikrSubtitle}
          icon={<TasbihIcon className="h-5 w-5" />}
        />
        <QuickLink
          href="/tilawat"
          title={t.dashboard.quick.tilawatTitle}
          subtitle={t.dashboard.quick.tilawatSubtitle}
          icon={<BookIcon className="h-5 w-5" />}
        />
        <QuickLink
          href="/hifazat"
          title={t.dashboard.quick.hifazatTitle}
          subtitle={t.dashboard.quick.hifazatSubtitle}
          icon={<ShieldIcon className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="font-medium text-foreground">{t.dashboard.last14Days}</p>
          <Legend />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : data ? (
          <div className="overflow-x-auto pb-1">
            <div className="min-w-140">
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
                    const dayLabel = getPrayerLabel(prayer.key, day.date);
                    return (
                      <span
                        key={day.date}
                        title={`${dayLabel} · ${formatDisplayDate(day.date)} · ${status ?? t.dashboard.noRecord}`}
                        className={`h-5 rounded-sm ${status ? CELL_STYLES[status] : "bg-status-empty"}`}
                      />
                    );
                  })}
                </div>
              ))}
              {data.customPrayers.map((custom) => (
                <div
                  key={custom.id}
                  className="mb-1 grid grid-cols-[70px_repeat(14,1fr)] items-center gap-1"
                >
                  <span className="truncate pr-1 text-xs text-foreground/60" title={custom.name}>
                    {custom.name}
                  </span>
                  {data.grid.map((day) => {
                    const status = custom.statuses[day.date];
                    return (
                      <span
                        key={day.date}
                        title={`${custom.name} · ${formatDisplayDate(day.date)} · ${status ?? t.dashboard.noRecord}`}
                        className={`h-5 rounded-sm ${status ? CELL_STYLES[status] ?? "bg-status-jamaat" : "bg-status-empty"}`}
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
  href,
  accent = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  accent?: "primary" | "gold";
}) {
  const content = (
    <>
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
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/30"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {content}
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
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-foreground/50">
      <LegendItem colorClass="bg-status-jamaat" label={t.dashboard.legend.jamaat} />
      <LegendItem colorClass="bg-status-infradi" label={t.dashboard.legend.infradi} />
      <LegendItem colorClass="bg-status-qaza" label={t.dashboard.legend.qaza} />
      <LegendItem colorClass="bg-status-empty" label={t.dashboard.legend.empty} />
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
