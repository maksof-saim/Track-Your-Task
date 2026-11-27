"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PRAYERS, STATUSES, getPrayerStatuses, todayISO, formatDisplayDate, getPrayerLabel, type PrayerKey, type StatusKey } from "@/lib/prayerMeta";
import AddCustomItem from "@/components/AddCustomItem";
import { isFutureDate, getPreviousDay, getNextDay } from "@/lib/dateUtils";
import { useI18n } from "@/lib/i18n/client";

type EntryMap = Partial<Record<PrayerKey, StatusKey>>;
type CustomPrayer = { id: string; name: string };
type CustomEntryMap = Partial<Record<string, StatusKey>>;

const STATUS_STYLES: Record<StatusKey, string> = {
  JAMAAT: "border-status-jamaat bg-status-jamaat/10 text-status-jamaat",
  INFRADI: "border-status-infradi bg-status-infradi/10 text-status-infradi",
  QAZA: "border-status-qaza bg-status-qaza/10 text-status-qaza",
};

function getJson(url: string) {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  });
}

export default function PrayerPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [date, setDate] = useState(todayISO());
  const [entries, setEntries] = useState<EntryMap>({});
  const [customPrayers, setCustomPrayers] = useState<CustomPrayer[]>([]);
  const [customEntries, setCustomEntries] = useState<CustomEntryMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function handleDateChange(newDate: string) {
    if (isFutureDate(newDate)) {
      toast.error(t.prayer.toast.futureDate, {
        description: t.prayer.toast.futureDateHint,
      });
      return;
    }
    setDate(newDate);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getJson(`/api/prayer?date=${date}`),
      getJson("/api/custom/prayers"),
      getJson(`/api/prayer?date=${date}&custom=true`),
    ])
      .then(([standard, customList, customLogs]) => {
        if (cancelled) return;

        const map: EntryMap = {};
        for (const entry of standard.entries ?? []) {
          map[entry.prayer as PrayerKey] = entry.status as StatusKey;
        }

        const customMap: CustomEntryMap = {};
        for (const entry of customLogs.customEntries ?? []) {
          customMap[entry.customPrayerId] = entry.status as StatusKey;
        }

        setEntries(map);
        setCustomPrayers(customList.customPrayers ?? []);
        setCustomEntries(customMap);
      })
      .catch(() => {
        if (cancelled) return;
        // Clear the old date's values so they cannot be saved under the new date by mistake.
        setEntries({});
        setCustomEntries({});
        toast.error(t.prayer.toast.loadFail, {
          description: t.prayer.toast.loadFailHint,
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  function setStatus(prayer: PrayerKey, status: StatusKey) {
    setEntries((prev) => ({ ...prev, [prayer]: status }));
  }

  function setCustomStatus(prayerId: string, status: StatusKey) {
    setCustomEntries((prev) => ({ ...prev, [prayerId]: status }));
  }

  async function addCustomPrayer(name: string) {
    const res = await fetch("/api/custom/prayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to add custom prayer");
    setCustomPrayers((prev) => [...prev, data]);
  }

  async function removeCustomPrayer(prayer: CustomPrayer) {
    const confirmed = window.confirm(
      `Remove "${prayer.name}"? Its saved records will also be deleted.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/custom/prayers/${prayer.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(t.prayer.toast.removeFail, { description: t.prayer.toast.removeFailHint });
        return;
      }
      setCustomPrayers((prev) => prev.filter((item) => item.id !== prayer.id));
      setCustomEntries((prev) => {
        const next = { ...prev };
        delete next[prayer.id];
        return next;
      });
      toast.success(t.prayer.toast.removeSuccess);
        } catch {
      toast.error(t.prayer.toast.removeFail, {
        description: t.prayer.toast.removeFailHint,
      });
    }
  }

  async function clearEntry(body: { prayer?: PrayerKey; customPrayerId?: string }) {
    try {
      const res = await fetch("/api/prayer", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, ...body }),
      });
      if (!res.ok) {
        toast.error(t.prayer.toast.clearFail, { description: t.prayer.toast.clearFailHint });
        return;
      }

      if (body.prayer) {
        const key = body.prayer;
        setEntries((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
      if (body.customPrayerId) {
        const id = body.customPrayerId;
        setCustomEntries((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
            toast.success(t.prayer.toast.clear);
    } catch {
      toast.error(t.prayer.toast.clearFail, {
        description: t.prayer.toast.clearFailHint,
      });
    }
  }

  async function handleSave() {
    const filled = PRAYERS.filter((p) => entries[p.key]);
    const customFilled = customPrayers.filter((p) => customEntries[p.id]);

    if (filled.length === 0 && customFilled.length === 0) {
      toast.error(t.prayer.toast.selectOne, {
        description: t.prayer.toast.selectOneHint,
      });
      return;
    }

    setSaving(true);

    try {
      const requests: Promise<Response>[] = [];

      if (filled.length > 0) {
        requests.push(
          fetch("/api/prayer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date,
              entries: filled.map((p) => ({ prayer: p.key, status: entries[p.key] })),
            }),
          }),
        );
      }

      if (customFilled.length > 0) {
        requests.push(
          fetch("/api/prayer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date,
              customEntries: customFilled.map((p) => ({
                customPrayerId: p.id,
                status: customEntries[p.id],
              })),
            }),
          }),
        );
      }

      const responses = await Promise.all(requests);
      const failed = responses.find((res) => !res.ok);

      if (failed) {
        const data = await failed.json().catch(() => ({}));
        toast.error(t.prayer.toast.failed, {
          description: data.error || t.prayer.toast.failedHint,
        });
        return;
      }

      toast.success(t.prayer.toast.saved, {
        description: t.prayer.toast.savedHint,
      });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      toast.error(t.prayer.toast.failed, {
        description: t.prayer.toast.failedHint,
      });
    } finally {
      setSaving(false);
    }
  }

  const loggedCount = PRAYERS.filter((p) => entries[p.key]).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t.prayer.title}</h1>
          <p className="text-sm text-foreground/60">
            {t.prayer.subtitle}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface-muted/50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                <svg className="h-5 w-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/60">{t.prayer.selectedDateLabel}</p>
                <p className="text-sm font-semibold text-foreground">{formatDisplayDate(date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDateChange(getPreviousDay(date))}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:border-primary-300 transition-colors"
              >
                {t.common.previous}
              </button>
              <button
                onClick={() => handleDateChange(todayISO())}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:border-primary-300 transition-colors"
              >
                {t.common.today}
              </button>
              <button
                onClick={() => handleDateChange(getNextDay(date))}
                disabled={isFutureDate(getNextDay(date))}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:border-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.common.next}
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label htmlFor="prayer-date" className="text-xs font-medium text-foreground/60">
              {t.prayer.selectDateHint}
            </label>
            <input
              id="prayer-date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm text-foreground/70">
        <span>{t.prayer.recordedCount(loggedCount, PRAYERS.length)}</span>
      </div>

      <div className={`flex flex-col gap-3 ${loading ? "opacity-50" : ""}`}>
        {PRAYERS.map((prayer) => (
          <div
            key={prayer.key}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-base font-medium text-foreground">{getPrayerLabel(prayer.key, date)}</span>
            <div className={`grid gap-2 ${getPrayerStatuses(prayer.key).length === 1 ? "grid-cols-1" : "grid-cols-3"}`}>
              {getPrayerStatuses(prayer.key).map((status) => {
                const active = entries[prayer.key] === status.key;
                return (
                  <button
                    key={status.key}
                    type="button"
                    onClick={() => setStatus(prayer.key, status.key)}
                    title={status.hint}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${active
                      ? STATUS_STYLES[status.key]
                      : "border-border text-foreground/50 hover:border-primary-300 hover:text-foreground"
                      }`}
                  >
                    {status.label}
                  </button>
                );
              })}
            </div>
            {entries[prayer.key] && (
              <button
                type="button"
                onClick={() => clearEntry({ prayer: prayer.key })}
                className="self-start rounded-lg px-2 py-1 text-xs font-medium text-foreground/50 hover:text-status-qaza hover:underline sm:self-auto"
              >
                {t.prayer.clear}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Custom Prayers Section */}
      {customPrayers.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground/70">{t.prayer.customHeading}</h2>
          <div className={`flex flex-col gap-3 ${loading ? "opacity-50" : ""}`}>
            {customPrayers.map((prayer) => (
              <div
                key={prayer.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start">
                  <span className="break-words text-base font-medium text-foreground">{prayer.name}</span>
                  {customEntries[prayer.id] && (
                    <button
                      type="button"
                      onClick={() => clearEntry({ customPrayerId: prayer.id })}
                      className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-foreground/50 hover:text-status-qaza hover:underline"
                    >
                      {t.prayer.clear}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeCustomPrayer(prayer)}
                    className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-status-qaza hover:underline"
                  >
                    {t.prayer.remove}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map((status) => {
                    const active = customEntries[prayer.id] === status.key;
                    return (
                      <button
                        key={status.key}
                        type="button"
                        onClick={() => setCustomStatus(prayer.id, status.key)}
                        title={status.hint}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${active
                          ? STATUS_STYLES[status.key]
                          : "border-border text-foreground/50 hover:border-primary-300 hover:text-foreground"
                          }`}
                      >
                        {status.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Prayer */}
      <div className="mt-6">
        <AddCustomItem
          type="prayer"
          onAdd={addCustomPrayer}
          placeholder={t.prayer.addCustom.placeholder}
        />
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center justify-center w-full rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60 sm:w-auto"
        >
          {saving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t.prayer.saveButton.saving}
            </>
          ) : (
            t.prayer.saveButton.default
          )}
        </button>
      </div>
    </div>
  );
}