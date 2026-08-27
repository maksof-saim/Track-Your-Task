"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PRAYERS, STATUSES, todayISO, formatDisplayDate, type PrayerKey, type StatusKey } from "@/lib/prayerMeta";

type EntryMap = Partial<Record<PrayerKey, StatusKey>>;

const STATUS_STYLES: Record<StatusKey, string> = {
  JAMAAT: "border-status-jamaat bg-status-jamaat/10 text-status-jamaat",
  INFRADI: "border-status-infradi bg-status-infradi/10 text-status-infradi",
  QAZA: "border-status-qaza bg-status-qaza/10 text-status-qaza",
};

export default function PrayerPage() {
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [entries, setEntries] = useState<EntryMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
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
    return () => {
      cancelled = true;
    };
  }, [date]);

  function setStatus(prayer: PrayerKey, status: StatusKey) {
    setEntries((prev) => ({ ...prev, [prayer]: status }));
  }

  async function handleSave() {
    const filled = PRAYERS.filter((p) => entries[p.key]);
    if (filled.length === 0) {
      toast.error("Please select at least one prayer status");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/prayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        entries: filled.map((p) => ({ prayer: p.key, status: entries[p.key] })),
      }),
    });
    setSaving(false);

    if (res.ok) {
      toast.success("Prayer record saved successfully!", {
        description: "Your prayer status has been recorded.",
      });
      setTimeout(() => router.push("/"), 1500);
    } else {
      toast.error("Failed to save record", {
        description: "Please try again.",
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
            onChange={(e) => setDate(e.target.value)}
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

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Saving..." : "Save Prayer Record"}
        </button>
      </div>
    </div>
  );
}
