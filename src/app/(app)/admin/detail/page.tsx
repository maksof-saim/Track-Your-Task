"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { todayISO } from "@/lib/prayerMeta";
import { getPreviousDay, getNextDay, formatDisplayDate } from "@/lib/dateUtils";
import { PRAYERS, STATUSES } from "@/lib/prayerMeta";

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
  const userId = searchParams.get("userId");
  const initialDate = searchParams.get("date") || todayISO();

  const [date, setDate] = useState(initialDate);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("User ID is required");
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
        toast.error("Failed to load user details", {
          description: e.message,
        });
      })
      .finally(() => setLoading(false));
  }, [userId, date]);

  function handleDateChange(newDate: string) {
    if (newDate > todayISO()) {
      toast.error("Cannot select future date", {
        description: "Please select today or a past date.",
      });
      return;
    }
    setDate(newDate);
  }

  function goToPreviousDay() {
    setDate(getPreviousDay(date));
  }

  function goToNextDay() {
    const next = getNextDay(date);
    if (next > todayISO()) {
      toast.error("Cannot view future dates");
      return;
    }
    setDate(next);
  }

  function goToToday() {
    setDate(todayISO());
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-status-qaza/30 bg-status-qaza/5 p-8 text-center">
          <p className="text-status-qaza font-medium">{error}</p>
          <button
            onClick={() => router.push("/admin")}
            className="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
          >
            Back to Admin
          </button>
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
              {loading ? `Loading records for ${formatDisplayDate(date)}...` : "Loading user details..."}
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

  if (!hasAnyRecords) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Admin
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{detail.user.name}</h1>
              <p className="text-sm text-foreground/60">{detail.user.email}</p>
              <div className="mt-2 flex gap-4 text-xs text-foreground/50">
                <span>Role: {detail.user.role}</span>
                <span>Total Recorded Days: {detail.totalRecordedDays}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousDay}
                className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm hover:border-primary-300"
              >
                Previous
              </button>
              <button
                onClick={goToToday}
                className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm hover:border-primary-300"
              >
                Today
              </button>
              <button
                onClick={goToNextDay}
                disabled={getNextDay(date) > todayISO()}
                className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm hover:border-primary-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <label htmlFor="detail-date" className="text-sm font-medium text-foreground/60">
              Record Date:
            </label>
            <input
              id="detail-date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
            <span className="text-sm font-medium text-primary-500">{formatDisplayDate(date)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <div className="mb-4 text-4xl">📅</div>
          <p className="text-lg font-medium text-foreground">No records found for this date</p>
          <p className="mt-2 text-sm text-foreground/50">
            {detail.user.name} does not have any records for {formatDisplayDate(date)}
          </p>
        </div>
      </div>
    );
  }

  const jamaatCount = detail.prayers.filter(p => p.status === 'JAMAAT').length;
  const infradiCount = detail.prayers.filter(p => p.status === 'INFRADI').length;
  const qazaCount = detail.prayers.filter(p => p.status === 'QAZA').length;
  const totalZikrCount = detail.zikr.reduce((sum, z) => sum + z.count, 0);
  const customZikrCount = detail.customZikr.reduce((sum, z) => sum + z.count, 0);
  const tilawatDone = detail.tilawat.filter(t => t.done).length;
  const customTilawatDone = detail.customTilawat.filter(t => t.done).length;
  const hifazatDone = detail.hifazat.filter(h => h.done).length;
  const customHifazatDone = detail.customHifazat.filter(h => h.done).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Admin
        </button>
      </div>

      {/* User Info Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{detail.user.name}</h1>
            <p className="text-sm text-foreground/60">{detail.user.email}</p>
            <div className="mt-2 flex gap-4 text-xs text-foreground/50">
              <span>Role: {detail.user.role}</span>
              <span>Total Recorded Days: {detail.totalRecordedDays}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousDay}
              className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm hover:border-primary-300"
            >
              Previous
            </button>
            <button
              onClick={goToToday}
              className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm hover:border-primary-300"
            >
              Today
            </button>
            <button
              onClick={goToNextDay}
              disabled={getNextDay(date) > todayISO()}
              className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm hover:border-primary-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="detail-date" className="text-sm font-medium text-foreground/60">
            Record Date:
          </label>
          <input
            id="detail-date"
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400"
          />
          <span className="text-sm font-medium text-primary-500">{formatDisplayDate(date)}</span>
        </div>
      </div>

      {/* Prayer Records */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Namaz</h2>
        <div className="mb-4 grid grid-cols-3 gap-4 rounded-xl bg-surface-muted p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-status-jamaat">{jamaatCount}</p>
            <p className="text-xs text-foreground/60">Jamaat</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-status-infradi">{infradiCount}</p>
            <p className="text-xs text-foreground/60">Infradi</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-status-qaza">{qazaCount}</p>
            <p className="text-xs text-foreground/60">Qaza</p>
          </div>
        </div>
        <div className="space-y-2">
          {PRAYERS.map((prayer) => {
            const log = detail.prayers.find(p => p.prayer === prayer.key);
            const status = log?.status;
            return (
              <div key={prayer.key} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3">
                <span className="font-medium text-foreground">{prayer.label}</span>
                {status ? (
                  <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
                    {STATUSES.find(s => s.key === status)?.label || status}
                  </span>
                ) : (
                  <span className="text-xs text-foreground/40">Not recorded</span>
                )}
              </div>
            );
          })}
        </div>
        {detail.customPrayers.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground/70">Custom Prayers</h3>
            <div className="space-y-2">
              {detail.customPrayers.map((cp) => (
                <div key={cp.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3">
                  <span className="font-medium text-foreground">{cp.name}</span>
                  {cp.status ? (
                    <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[cp.status]}`}>
                      {STATUSES.find(s => s.key === cp.status)?.label || cp.status}
                    </span>
                  ) : (
                    <span className="text-xs text-foreground/40">Not recorded</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zikr Records */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Zikar</h2>
        <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-surface-muted p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{totalZikrCount}</p>
            <p className="text-xs text-foreground/60">Standard Zikr</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{customZikrCount}</p>
            <p className="text-xs text-foreground/60">Custom Zikr</p>
          </div>
        </div>
        <div className="space-y-2">
          {detail.zikr.map((z) => (
            <div key={z.name} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3">
              <span className="font-medium text-foreground">{z.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground/60">{z.mode === 'KASRAT' ? 'Kasrat se' : z.count}</span>
              </div>
            </div>
          ))}
        </div>
        {detail.customZikr.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground/70">Custom Zikr</h3>
            <div className="space-y-2">
              {detail.customZikr.map((cz) => (
                <div key={cz.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3">
                  <span className="font-medium text-foreground">{cz.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground/60">{cz.mode === 'KASRAT' ? 'Kasrat se' : cz.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tilawat Records */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Tilawat</h2>
        <div className="mb-4 flex items-center gap-4 rounded-xl bg-surface-muted p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{tilawatDone}</p>
            <p className="text-xs text-foreground/60">Standard Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{customTilawatDone}</p>
            <p className="text-xs text-foreground/60">Custom Completed</p>
          </div>
        </div>
        <div className="space-y-2">
          {detail.tilawat.map((t) => (
            <div key={t.item} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3">
              <span className="font-medium text-foreground">{t.item}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.done ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-foreground/40'}`}>
                {t.done ? 'Done' : 'Not Done'}
              </span>
            </div>
          ))}
        </div>
        {detail.customTilawat.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground/70">Custom Tilawat</h3>
            <div className="space-y-2">
              {detail.customTilawat.map((ct) => (
                <div key={ct.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3">
                  <span className="font-medium text-foreground">{ct.name}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ct.done ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-foreground/40'}`}>
                    {ct.done ? 'Done' : 'Not Done'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hifazat Records */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Hifazat</h2>
        <div className="mb-4 flex items-center gap-4 rounded-xl bg-surface-muted p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{hifazatDone}</p>
            <p className="text-xs text-foreground/60">Standard Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{customHifazatDone}</p>
            <p className="text-xs text-foreground/60">Custom Completed</p>
          </div>
        </div>
        <div className="space-y-2">
          {detail.hifazat.map((h) => (
            <div key={h.item} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3">
              <span className="font-medium text-foreground">{h.item}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${h.done ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-foreground/40'}`}>
                {h.done ? 'Done' : 'Not Done'}
              </span>
            </div>
          ))}
        </div>
        {detail.customHifazat.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground/70">Custom Hifazat</h3>
            <div className="space-y-2">
              {detail.customHifazat.map((ch) => (
                <div key={ch.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-3">
                  <div>
                    <span className="font-medium text-foreground">{ch.name}</span>
                    {ch.hint && <p className="text-xs text-foreground/50">{ch.hint}</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ch.done ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-foreground/40'}`}>
                    {ch.done ? 'Done' : 'Not Done'}
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
