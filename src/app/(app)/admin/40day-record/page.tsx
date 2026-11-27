"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDisplayDate, PRAYERS } from "@/lib/prayerMeta";
import { useI18n } from "@/lib/i18n/client";

type RecordDay = {
  date: string;
  prayers: Record<string, string>;
  zikr: Array<{ name: string; count: number; mode: string }>;
  tilawat: Array<{ item: string; done: boolean }>;
  hifazat: Array<{ item: string; done: boolean }>;
};

type ChallengeData = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  challengePeriod: {
    start: string;
    end: string;
    totalDays: number;
  };
  records: RecordDay[];
  stats: {
    daysWithRecords: number;
    totalPrayers: number;
    jamaatCount: number;
    infradiCount: number;
    qazaCount: number;
    totalZikr: number;
    totalTilawat: number;
    totalHifazat: number;
  };
};

const STATUS_STYLES: Record<string, string> = {
  JAMAAT: "border-status-jamaat bg-status-jamaat/10 text-status-jamaat",
  INFRADI: "border-status-infradi bg-status-infradi/10 text-status-infradi",
  QAZA: "border-status-qaza bg-status-qaza/10 text-status-qaza",
};

export default function Admin7DayRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const userId = searchParams.get("userId");

  const [data, setData] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError(t.admin.userIdRequired);
      setLoading(false);
      return;
    }

    async function fetch40DayRecord() {
      try {
        const res = await fetch(`/api/admin/user-40day-record?userId=${userId}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || t.admin.failedLoad7);
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.admin.failedLoad7);
      } finally {
        setLoading(false);
      }
    }

    fetch40DayRecord();
  }, [userId]);

  const itemLabel = (map: Record<string, { label: string }>, key: string) =>
    map[key]?.label ?? key;

  const statusLabel = (status: string) =>
    t.meta.statuses[status as keyof typeof t.meta.statuses] ?? status;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface p-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <p className="text-sm text-foreground/60">{t.admin.loading7}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-status-qaza/30 bg-status-qaza/5 p-8 text-center">
          <p className="font-medium text-status-qaza">{error || t.admin.failedLoad7}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:border-primary-300"
          >
            {t.admin.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground"
        >
          {t.admin.back}
        </button>
      </div>

      {/* User Info */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{data.user.name}</h1>
            <p className="text-sm text-foreground/60">{data.user.email}</p>
            <div className="mt-2 text-xs text-foreground/50">
              <span>
                {t.admin.role}: {data.user.role}
              </span>
            </div>
          </div>
          <div className="text-start sm:text-end">
            <p className="text-sm font-medium text-foreground/60">{t.admin.challenge}</p>
            <p className="text-xs text-foreground/50">
              {formatDisplayDate(data.challengePeriod.start, locale)} -{" "}
              {formatDisplayDate(data.challengePeriod.end, locale)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-foreground/60">{t.admin.daysRecorded}</p>
          <p className="text-2xl font-bold text-foreground">{data.stats.daysWithRecords}</p>
          <p className="text-xs text-foreground/40">{t.admin.ofDays(data.challengePeriod.totalDays)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-foreground/60">{t.admin.totalPrayers}</p>
          <p className="text-2xl font-bold text-foreground">{data.stats.totalPrayers}</p>
          <p className="text-xs text-foreground/40">{t.admin.jamaatCount(data.stats.jamaatCount)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-foreground/60">{t.admin.totalZikrCount}</p>
          <p className="text-2xl font-bold text-foreground">{data.stats.totalZikr}</p>
          <p className="text-xs text-foreground/40">{t.admin.kasratNotCounted}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-foreground/60">{t.admin.tilawatHifazat}</p>
          <p className="text-2xl font-bold text-foreground">
            {data.stats.totalTilawat + data.stats.totalHifazat}
          </p>
          <p className="text-xs text-foreground/40">{t.admin.itemsCompleted}</p>
        </div>
      </div>

      {/* Detailed Records */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t.admin.dailyRecords}</h2>
        <div className="space-y-4">
          {data.records.map((record) => {
            const hasData =
              Object.keys(record.prayers).length > 0 ||
              record.zikr.length > 0 ||
              record.tilawat.length > 0 ||
              record.hifazat.length > 0;

            return (
              <div
                key={record.date}
                className={`rounded-xl border ${hasData ? "border-border bg-surface-muted/30" : "border-border/50 bg-surface-muted/10"} p-4`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {formatDisplayDate(record.date, locale)}
                  </span>
                  {!hasData && <span className="text-xs text-foreground/40">{t.admin.noRecordsShort}</span>}
                </div>

                {hasData && (
                  <div className="space-y-3">
                    {/* Prayers */}
                    {Object.keys(record.prayers).length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium text-foreground/60">{t.admin.prayers}</p>
                        <div className="flex flex-wrap gap-2">
                          {PRAYERS.map((prayer) => {
                            const status = record.prayers[prayer.key];
                            if (!status) return null;
                            return (
                              <span
                                key={prayer.key}
                                className={`rounded-lg border px-2 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
                              >
                                {t.meta.prayers[prayer.key as keyof typeof t.meta.prayers] ?? prayer.label}:{" "}
                                {statusLabel(status)}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Zikr */}
                    {record.zikr.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium text-foreground/60">{t.admin.zikr}</p>
                        <div className="flex flex-wrap gap-2">
                          {record.zikr.map((z, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg border border-border bg-surface-muted px-2 py-1 text-xs"
                            >
                              {z.name}: {z.mode === "KASRAT" ? t.admin.kasratSe : z.count}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tilawat */}
                    {record.tilawat.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium text-foreground/60">{t.admin.tilawat}</p>
                        <div className="flex flex-wrap gap-2">
                          {record.tilawat.map((item, idx) => (
                            <span
                              key={idx}
                              className={`rounded-lg border px-2 py-1 text-xs ${
                                item.done
                                  ? "border-status-jamaat bg-status-jamaat/10 text-status-jamaat"
                                  : "border-border bg-surface-muted text-foreground/60"
                              }`}
                            >
                              {itemLabel(t.meta.tilawat, item.item)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hifazat */}
                    {record.hifazat.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium text-foreground/60">{t.admin.hifazat}</p>
                        <div className="flex flex-wrap gap-2">
                          {record.hifazat.map((item, idx) => (
                            <span
                              key={idx}
                              className={`rounded-lg border px-2 py-1 text-xs ${
                                item.done
                                  ? "border-status-jamaat bg-status-jamaat/10 text-status-jamaat"
                                  : "border-border bg-surface-muted text-foreground/60"
                              }`}
                            >
                              {itemLabel(t.meta.hifazat, item.item)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
