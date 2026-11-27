"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PRAYERS, STATUSES, todayISO } from "@/lib/prayerMeta";
import { getPreviousDay, getNextDay, formatDisplayDate } from "@/lib/dateUtils";
import { useI18n } from "@/lib/i18n/client";

type UserDetail = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  totalRecordedDays: number;
  selectedDate: string;
  prayers: Array<{ prayer: string; status: string }>;
  customPrayers: Array<{ id: string; name: string; status: string }>;
  zikr: Array<{ name: string; count: number; mode: string }>;
  customZikr: Array<{ id: string; name: string; count: number; mode: string }>;
  tilawat: Array<{ item: string; done: boolean }>;
  customTilawat: Array<{ id: string; name: string; done: boolean }>;
  hifazat: Array<{ item: string; done: boolean }>;
  customHifazat: Array<{ id: string; name: string; done: boolean; hint?: string | null }>;
};

const STATUS_STYLES: Record<string, string> = {
  JAMAAT: "border-status-jamaat bg-status-jamaat/10 text-status-jamaat",
  INFRADI: "border-status-infradi bg-status-infradi/10 text-status-infradi",
  QAZA: "border-status-qaza bg-status-qaza/10 text-status-qaza",
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const userId = searchParams.get("userId");
  const initialDate = searchParams.get("date") || todayISO();

  const [date, setDate] = useState(initialDate);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError(t.admin.userIdRequired);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/admin/user-detail?userId=${userId}&date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setDetail(data);
      })
      .catch((e) => {
        setError(e.message);
        toast.error(t.admin.failedLoadDetails, {
          description: e.message,
        });
      })
      .finally(() => setLoading(false));
  }, [userId, date]);

  function handleDateChange(newDate: string) {
    setDate(newDate);
  }

  function goToPreviousDay() {
    setDate(getPreviousDay(date));
  }

  function goToNextDay() {
    setDate(getNextDay(date));
  }

  function goToToday() {
    setDate(todayISO());
  }

  const itemLabel = (map: Record<string, { label: string }>, key: string) =>
    map[key]?.label ?? key;

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-status-qaza/30 bg-status-qaza/5 p-8 text-center">
          <p className="font-medium text-status-qaza">{error}</p>
          <p className="mt-2 text-sm text-foreground/60">{t.admin.invalidDate}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:border-primary-300"
            >
              {t.admin.backToAdmin}
            </button>
            {userId && (
              <button
                onClick={() => {
                  setDate(todayISO());
                  setError(null);
                }}
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
              >
                {t.admin.goToToday}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading || !detail) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface p-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <p className="text-sm text-foreground/60">
              {loading
                ? t.admin.loadingRecords(formatDisplayDate(date, locale))
                : t.admin.loadingUserDetails}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has any records for the selected date
  const hasAnyRecords =
    detail.prayers.length > 0 ||
    detail.customPrayers.length > 0 ||
    detail.zikr.length > 0 ||
    detail.customZikr.length > 0 ||
    detail.tilawat.length > 0 ||
    detail.customTilawat.length > 0 ||
    detail.hifazat.length > 0 ||
    detail.customHifazat.length > 0;

  const header = (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{detail.user.name}</h1>
          <p className="text-sm text-foreground/60">{detail.user.email}</p>
          <div className="mt-2 flex gap-4 text-xs text-foreground/50">
            <span>
              {t.admin.role}: {detail.user.role}
            </span>
            <span>{t.admin.totalRecordedDays(detail.totalRecordedDays)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => router.push(`/admin/40day-record?userId=${userId}`)}
            className="rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-600"
          >
            {t.admin.sevenDayRecord}
          </button>
          <button
            onClick={goToPreviousDay}
            className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm hover:border-primary-300"
          >
            {t.common.previous}
          </button>
          <button
            onClick={goToToday}
            className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm hover:border-primary-300"
          >
            {t.common.today}
          </button>
          <button
            onClick={goToNextDay}
            className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm hover:border-primary-300"
          >
            {t.common.next}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label htmlFor="detail-date" className="text-sm font-medium text-foreground/60">
          {t.admin.recordDate}:
        </label>
        <input
          id="detail-date"
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400"
        />
        <span className="text-sm font-medium text-primary-500">
          {formatDisplayDate(date, locale)}
        </span>
      </div>
    </div>
  );

  if (!hasAnyRecords) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground"
          >
            {t.admin.backToAdmin}
          </button>
        </div>

        {header}

        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <div className="mb-4 text-4xl">📅</div>
          <p className="text-lg font-medium text-foreground">{t.admin.noRecords}</p>
          <p className="mt-2 text-sm text-foreground/50">
            {t.admin.noUserRecords(detail.user.name, formatDisplayDate(date, locale))}
          </p>
          <p className="mt-1 text-xs text-foreground/40">{t.admin.selectDifferentDate}</p>
        </div>
      </div>
    );
  }

  const jamaatCount = detail.prayers.filter((p) => p.status === "JAMAAT").length;
  const infradiCount = detail.prayers.filter((p) => p.status === "INFRADI").length;
  const qazaCount = detail.prayers.filter((p) => p.status === "QAZA").length;
  const totalZikrCount = detail.zikr.reduce((sum, z) => sum + z.count, 0);
  const customZikrCount = detail.customZikr.reduce((sum, z) => sum + z.count, 0);
  const tilawatDone = detail.tilawat.filter((t) => t.done).length;
  const customTilawatDone = detail.customTilawat.filter((t) => t.done).length;
  const hifazatDone = detail.hifazat.filter((h) => h.done).length;
  const customHifazatDone = detail.customHifazat.filter((h) => h.done).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground"
        >
          {t.admin.backToAdmin}
        </button>
      </div>

      {/* User Info Card */}
      {header}

      {/* Prayer Records */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t.nav.namaz}</h2>
        <div className="mb-4 grid grid-cols-3 gap-4 rounded-xl bg-surface-muted p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-status-jamaat">{jamaatCount}</p>
            <p className="text-xs text-foreground/60">{t.meta.statuses.JAMAAT}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-status-infradi">{infradiCount}</p>
            <p className="text-xs text-foreground/60">{t.meta.statuses.INFRADI}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-status-qaza">{qazaCount}</p>
            <p className="text-xs text-foreground/60">{t.meta.statuses.QAZA}</p>
          </div>
        </div>
        <div className="space-y-2">
          {PRAYERS.map((prayer) => {
            const log = detail.prayers.find((p) => p.prayer === prayer.key);
            const status = log?.status;
            return (
              <div
                key={prayer.key}
                className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3"
              >
                <span className="font-medium text-foreground">
                  {t.meta.prayers[prayer.key as keyof typeof t.meta.prayers] ?? prayer.label}
                </span>
                {status ? (
                  <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
                    {t.meta.statuses[status as keyof typeof t.meta.statuses] ??
                      STATUSES.find((s) => s.key === status)?.label ??
                      status}
                  </span>
                ) : (
                  <span className="text-xs text-foreground/40">{t.admin.notRecorded}</span>
                )}
              </div>
            );
          })}
        </div>
        {detail.customPrayers.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground/70">
              {t.admin.customPrayers}
            </h3>
            <div className="space-y-2">
              {detail.customPrayers.map((cp) => (
                <div
                  key={cp.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3"
                >
                  <span className="font-medium text-foreground">{cp.name}</span>
                  {cp.status ? (
                    <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[cp.status]}`}>
                      {t.meta.statuses[cp.status as keyof typeof t.meta.statuses] ?? cp.status}
                    </span>
                  ) : (
                    <span className="text-xs text-foreground/40">{t.admin.notRecorded}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zikr Records */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t.nav.azkaar}</h2>
        <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-surface-muted p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{totalZikrCount}</p>
            <p className="text-xs text-foreground/60">{t.admin.standardZikr}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{customZikrCount}</p>
            <p className="text-xs text-foreground/60">{t.admin.customZikr}</p>
          </div>
        </div>
        <div className="space-y-2">
          {detail.zikr.map((z) => (
            <div
              key={z.name}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3"
            >
              <span className="font-medium text-foreground">{z.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground/60">
                  {z.mode === "KASRAT" ? t.admin.kasratSe : z.count}
                </span>
              </div>
            </div>
          ))}
        </div>
        {detail.customZikr.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground/70">{t.admin.customZikr}</h3>
            <div className="space-y-2">
              {detail.customZikr.map((cz) => (
                <div
                  key={cz.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3"
                >
                  <span className="font-medium text-foreground">{cz.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground/60">
                      {cz.mode === "KASRAT" ? t.admin.kasratSe : cz.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tilawat Records */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t.admin.tilawat}</h2>
        <div className="mb-4 flex items-center gap-4 rounded-xl bg-surface-muted p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{tilawatDone}</p>
            <p className="text-xs text-foreground/60">{t.admin.standardCompleted}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{customTilawatDone}</p>
            <p className="text-xs text-foreground/60">{t.admin.customCompleted}</p>
          </div>
        </div>
        <div className="space-y-2">
          {detail.tilawat.map((item) => (
            <div
              key={item.item}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3"
            >
              <span className="font-medium text-foreground">
                {itemLabel(t.meta.tilawat, item.item)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.done ? "bg-green-100 text-green-700" : "bg-surface-muted text-foreground/40"
                }`}
              >
                {item.done ? t.admin.done : t.admin.notDone}
              </span>
            </div>
          ))}
        </div>
        {detail.customTilawat.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground/70">{t.admin.customTilawat}</h3>
            <div className="space-y-2">
              {detail.customTilawat.map((ct) => (
                <div
                  key={ct.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3"
                >
                  <span className="font-medium text-foreground">{ct.name}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      ct.done ? "bg-green-100 text-green-700" : "bg-surface-muted text-foreground/40"
                    }`}
                  >
                    {ct.done ? t.admin.done : t.admin.notDone}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hifazat Records */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t.admin.hifazat}</h2>
        <div className="mb-4 flex items-center gap-4 rounded-xl bg-surface-muted p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{hifazatDone}</p>
            <p className="text-xs text-foreground/60">{t.admin.standardCompleted}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{customHifazatDone}</p>
            <p className="text-xs text-foreground/60">{t.admin.customCompleted}</p>
          </div>
        </div>
        <div className="space-y-2">
          {detail.hifazat.map((item) => (
            <div
              key={item.item}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3"
            >
              <span className="font-medium text-foreground">
                {itemLabel(t.meta.hifazat, item.item)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.done ? "bg-green-100 text-green-700" : "bg-surface-muted text-foreground/40"
                }`}
              >
                {item.done ? t.admin.done : t.admin.notDone}
              </span>
            </div>
          ))}
        </div>
        {detail.customHifazat.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground/70">{t.admin.customHifazat}</h3>
            <div className="space-y-2">
              {detail.customHifazat.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3"
                >
                  <div>
                    <span className="font-medium text-foreground">{ch.name}</span>
                    {ch.hint && <p className="text-xs text-foreground/50">{ch.hint}</p>}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      ch.done ? "bg-green-100 text-green-700" : "bg-surface-muted text-foreground/40"
                    }`}
                  >
                    {ch.done ? t.admin.done : t.admin.notDone}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
