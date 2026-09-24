"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { todayISO, formatDisplayDate } from "@/lib/prayerMeta";
import { isFriday } from "@/lib/checklistMeta";
import AddCustomItem from "@/components/AddCustomItem";
import { isFutureDate, getPreviousDay, getNextDay } from "@/lib/dateUtils";

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
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [done, setDone] = useState<Record<string, boolean>>({});
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
    fetch(`/api/checklist?date=${date}&section=${section}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        for (const entry of data.items ?? []) {
          map[entry.item] = entry.done;
        }
        setDone(map);
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
  }

  async function handleSave() {
    // Client-side validation
    const checkedCount = items.filter((i) => done[i.key]).length;
    if (checkedCount === 0) {
      toast.error("Please select at least one item", {
        description: `Mark at least one ${section.toLowerCase()} item as done.`,
      });
      return;
    }

    setSaving(true);
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

    if (res.ok) {
      toast.success(`${title} saved successfully!`, {
        description: "Your record has been updated.",
      });
      setTimeout(() => router.push("/"), 1500);
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error("Failed to save record", {
        description: data.error || "Please try again.",
      });
    }
  }

  const doneCount = items.filter((i) => done[i.key]).length;
  const friday = isFriday(date);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-foreground/60">{subtitle}</p>
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
                <p className="text-xs font-medium text-foreground/60">Selected Date</p>
                <p className="text-sm font-semibold text-foreground">{formatDisplayDate(date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDateChange(getPreviousDay(date))}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:border-primary-300 transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={() => handleDateChange(todayISO())}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:border-primary-300 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => handleDateChange(getNextDay(date))}
                disabled={isFutureDate(getNextDay(date))}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:border-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label htmlFor="checklist-date" className="text-xs font-medium text-foreground/60">
              Or select specific date:
            </label>
            <input
              id="checklist-date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm text-foreground/70">
        <span>{doneCount}/{items.length} completed</span>
      </div>

      <div className={`flex flex-col gap-2 ${loading ? "opacity-50" : ""}`}>
        {items.map((item) => {
          const disabled = item.fridayOnly && !friday;
          return (
            <label
              key={item.key}
              className={`flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-colors ${disabled ? "opacity-50" : "cursor-pointer hover:border-primary-300"
                }`}
            >
              <span>
                <span className="font-medium text-foreground">{item.label}</span>
                {item.fridayOnly && (
                  <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-600">
                    Friday Only
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
            `Save ${title}`
          )}
        </button>
      </div>
    </div>
  );
}
