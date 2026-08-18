"use client";

import { useEffect, useState } from "react";
import { todayISO, formatDisplayDate } from "@/lib/prayerMeta";
import { isFriday } from "@/lib/checklistMeta";

type ChecklistItemDef = {
  key: string;
  label: string;
  fridayOnly?: boolean;
  hint?: string;
};

export default function ChecklistPage({
  title,
  subtitle,
  section,
  items,
}: {
  title: string;
  subtitle: string;
  section: "TILAWAT" | "HIFAZAT";
  items: readonly ChecklistItemDef[];
}) {
  const [date, setDate] = useState(todayISO());
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/checklist?date=${date}&section=${section}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        for (const entry of data.items ?? []) {
          map[entry.item] = entry.done;
        }
        setDone(map);
        setSavedMessage(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, section]);

  function toggle(key: string) {
    setDone((prev) => ({ ...prev, [key]: !prev[key] }));
    setSavedMessage(null);
  }

  async function handleSave() {
    setSaving(true);
    setSavedMessage(null);
    const res = await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        section,
        items: items.map((i) => ({ item: i.key, done: Boolean(done[i.key]) })),
      }),
    });
    setSaving(false);
    setSavedMessage(res.ok ? "Record save ho gaya" : "Save nahi ho saka, dobara koshish karein");
  }

  const doneCount = items.filter((i) => done[i.key]).length;
  const friday = isFriday(date);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-foreground/60">{subtitle}</p>
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
        <span className="font-medium text-primary-500">{doneCount}/{items.length} mukammal</span>
      </div>

      <div className={`flex flex-col gap-2 ${loading ? "opacity-50" : ""}`}>
        {items.map((item) => {
          const disabled = item.fridayOnly && !friday;
          return (
            <label
              key={item.key}
              className={`flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-colors ${
                disabled ? "opacity-50" : "cursor-pointer hover:border-primary-300"
              }`}
            >
              <span>
                <span className="font-medium text-foreground">{item.label}</span>
                {item.fridayOnly && (
                  <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-600">
                    Sirf Juma
                  </span>
                )}
                {item.hint && <p className="text-xs text-foreground/50">{item.hint}</p>}
              </span>
              <input
                type="checkbox"
                checked={Boolean(done[item.key])}
                disabled={disabled}
                onChange={() => toggle(item.key)}
                className="h-5 w-5 shrink-0 rounded border-border text-primary-500 focus:ring-primary-300"
              />
            </label>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
        >
          {saving ? "Save ho raha hai..." : "Record Save Karein"}
        </button>
        {savedMessage && <span className="text-sm text-primary-500">{savedMessage}</span>}
      </div>
    </div>
  );
}
