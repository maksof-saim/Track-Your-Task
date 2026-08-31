"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PRAYERS, STATUSES, todayISO, formatDisplayDate, type PrayerKey, type StatusKey } from "@/lib/prayerMeta";
import AddCustomItem from "@/components/AddCustomItem";
import { isFutureDate } from "@/lib/dateUtils";

type EntryMap = Partial<Record<PrayerKey, StatusKey>>;
type CustomPrayer = { id: string; name: string };
type CustomEntryMap = Partial<Record<string, StatusKey>>;

const STATUS_STYLES: Record<StatusKey, string> = {
  JAMAAT: "border-status-jamaat bg-status-jamaat/10 text-status-jamaat",
  INFRADI: "border-status-infradi bg-status-infradi/10 text-status-infradi",
  QAZA: "border-status-qaza bg-status-qaza/10 text-status-qaza",
};

export default function PrayerPage() {
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [entries, setEntries] = useState<EntryMap>({});
  const [customPrayers, setCustomPrayers] = useState<CustomPrayer[]>([]);
  const [customEntries, setCustomEntries] = useState<CustomEntryMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function handleDateChange(newDate: string) {
    if (isFutureDate(newDate)) {
      toast.error("Cannot select future date", {
        description: "Please select today or a past date.",
      });
      return;
    }
    setDate(newDate);
  }

  useEffect(() => {
    let cancelled = false;

    // Fetch standard prayers
    fetch(`/api/prayer?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const map: EntryMap = {};
        for (const entry of data.entries ?? []) {
          map[entry.prayer as PrayerKey] = entry.status as StatusKey;
        }
        setEntries(map);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Fetch custom prayers
    fetch("/api/custom/prayers")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setCustomPrayers(data.customPrayers ?? []);
      });

    // Fetch custom prayer logs for the date
    fetch(`/api/prayer?date=${date}&custom=true`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const map: CustomEntryMap = {};
        for (const entry of data.customEntries ?? []) {
          map[entry.customPrayerId] = entry.status as StatusKey;
        }
        setCustomEntries(map);
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
    if (!res.ok) throw new Error("Failed to add custom prayer");
    const data = await res.json();
    setCustomPrayers((prev) => [...prev, data]);
  }

  async function handleSave() {
    const filled = PRAYERS.filter((p) => entries[p.key]);
    const customFilled = customPrayers.filter((p) => customEntries[p.id]);

    if (filled.length === 0 && customFilled.length === 0) {
      toast.error("Please select at least one prayer status", {
        description: "Choose a status for at least one prayer.",
      });
      return;
    }

    setSaving(true);

    // Save standard prayers
    const standardPromise = filled.length > 0 ? fetch("/api/prayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        entries: filled.map((p) => ({ prayer: p.key, status: entries[p.key] })),
      }),
    }) : Promise.resolve({ ok: true } as Response);

    // Save custom prayers
    const customPromise = customFilled.length > 0 ? fetch("/api/prayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        customEntries: customFilled.map((p) => ({ customPrayerId: p.id, status: customEntries[p.id] })),
      }),
    }) : Promise.resolve({ ok: true } as Response);

    const [standardRes, customRes] = await Promise.all([standardPromise, customPromise]);
    setSaving(false);

    if (standardRes.ok && customRes.ok) {
      toast.success("Prayer record saved successfully!", {
        description: "Your prayer status has been recorded.",
      });
      setTimeout(() => router.push("/"), 1500);
    } else {
      const errorRes = !standardRes.ok ? standardRes : customRes;
      const data = await errorRes.json().catch(() => ({}));
      toast.error("Failed to save prayer record", {
        description: data.error || "Please try again.",
      });
    }
  }

  const loggedCount = PRAYERS.filter((p) => entries[p.key]).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Prayer Record</h1>
          <p className="text-sm text-foreground/60">
            Select prayer status and save your record
          </p>
        </div>
        <div>
          <label htmlFor="date" className="mb-1 block text-xs font-medium text-foreground/60">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary-400"
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm text-foreground/70">
        <span>{formatDisplayDate(date)}</span>
        <span className="font-medium text-primary-500">{loggedCount}/{PRAYERS.length} recorded</span>
      </div>

      <div className={`flex flex-col gap-3 ${loading ? "opacity-50" : ""}`}>
        {PRAYERS.map((prayer) => (
          <div
            key={prayer.key}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-base font-medium text-foreground">{prayer.label}</span>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((status) => {
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
          </div>
        ))}
      </div>

      {/* Custom Prayers Section */}
      {customPrayers.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground/70">Custom Prayers</h2>
          <div className={`flex flex-col gap-3 ${loading ? "opacity-50" : ""}`}>
            {customPrayers.map((prayer) => (
              <div
                key={prayer.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-base font-medium text-foreground">{prayer.name}</span>
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
      {/* <div className="mt-6">
        <AddCustomItem
          type="prayer"
          onAdd={addCustomPrayer}
          placeholder="e.g., Tahajud, Sunnah, etc."
        />
      </div> */}

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center justify-center w-full rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60 sm:w-auto"
        >
          {saving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            "Save Prayer Record"
          )}
        </button>
      </div>
    </div>
  );
}
