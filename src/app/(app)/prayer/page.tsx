"use client";

import { useEffect, useState } from "react";
import { PRAYERS, STATUSES, todayISO, formatDisplayDate, type PrayerKey, type StatusKey } from "@/lib/prayerMeta";

type EntryMap = Partial<Record<PrayerKey, StatusKey>>;

const STATUS_STYLES: Record<StatusKey, string> = {
  JAMAAT: "border-status-jamaat bg-status-jamaat/10 text-status-jamaat",
  INFRADI: "border-status-infradi bg-status-infradi/10 text-status-infradi",
  QAZA: "border-status-qaza bg-status-qaza/10 text-status-qaza",
};

export default function PrayerPage() {
  const [date, setDate] = useState(todayISO());
  const [entries, setEntries] = useState<EntryMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

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
        setSavedMessage(null);
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
    setSavedMessage(null);
  }

  async function handleSave() {
    const filled = PRAYERS.filter((p) => entries[p.key]);
    if (filled.length === 0) return;

    setSaving(true);
    setSavedMessage(null);
    const res = await fetch("/api/prayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        entries: filled.map((p) => ({ prayer: p.key, status: entries[p.key] })),
      }),
    });
    setSaving(false);
    setSavedMessage(res.ok ? "Record save ho gaya" : "Save nahi ho saka, dobara koshish karein");
  }

  const loggedCount = PRAYERS.filter((p) => entries[p.key]).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Namaz ka Record</h1>
          <p className="text-sm text-foreground/60">
            Har namaz ke saamne uska status chunein aur save karein
          </p>
        </div>
        <div>
          <label htmlFor="date" className="mb-1 block text-xs font-medium text-foreground/60">
            Tareekh
          </label>
          <input
            id="date"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary-400"
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm text-foreground/70">
        <span>{formatDisplayDate(date)}</span>
        <span className="font-medium text-primary-500">{loggedCount}/{PRAYERS.length} record ho chuki</span>
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
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                      active
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

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
        >
          {saving ? "Save ho raha hai..." : "Record Save Karein"}
        </button>
        {savedMessage && (
          <span className="text-sm text-primary-500">{savedMessage}</span>
        )}
      </div>
    </div>
  );
}
