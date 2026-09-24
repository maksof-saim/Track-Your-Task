"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { todayISO, formatDisplayDate } from "@/lib/prayerMeta";
import { AZKAAR_TARGET_ITEMS } from "@/lib/checklistMeta";
import { isFutureDate, getPreviousDay, getNextDay } from "@/lib/dateUtils";

type ZikrMode = "COUNT" | "KASRAT";
type ZikrEntry = { name: string; count: number; mode: ZikrMode };
type Draft = { mode: ZikrMode; count: string };

const initialDraft = (entry?: ZikrEntry): Draft => ({
  mode: entry?.mode ?? "COUNT",
  count: entry ? String(entry.count) : "",
});

export default function ZikrPage() {
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [entries, setEntries] = useState<ZikrEntry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

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
    setLoading(true);
    fetch(`/api/zikr?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        const nextEntries: ZikrEntry[] = data.entries ?? [];
        setEntries(nextEntries);
        setDrafts(
          Object.fromEntries(
            AZKAAR_TARGET_ITEMS.map(({ name }) => [
              name,
              initialDraft(nextEntries.find((entry) => entry.name === name)),
            ]),
          ),
        );
      })
      .finally(() => setLoading(false));
  }, [date]);

  function updateDraft(name: string, changes: Partial<Draft>) {
    setDrafts((current) => ({ ...current, [name]: { ...current[name], ...changes } }));
  }

  async function saveEntry(name: string) {
    const draft = drafts[name] ?? initialDraft();
    const count = Number(draft.count);

    if (draft.mode === "COUNT") {
      if (draft.count === "" || draft.count.trim() === "") {
        toast.error("Please enter a count", {
          description: "Enter the number of times you performed this zikr.",
        });
        return;
      }
      if (!Number.isInteger(count) || count < 0) {
        toast.error("Invalid count", {
          description: "Please enter a valid positive number.",
        });
        return;
      }
      if (count === 0) {
        toast.error("Count cannot be zero", {
          description: "Please enter a number greater than 0 to save your zikr.",
        });
        return;
      }
      if (count > 1000000) {
        toast.error("Count too large", {
          description: "Count must be less than 1,000,000.",
        });
        return;
      }
    }

    setPending(name);
    const response = await fetch("/api/zikr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        name,
        mode: draft.mode,
        count: draft.mode === "COUNT" ? count : 0,
      }),
    });

    if (response.ok) {
      const nextEntry = await response.json();
      setEntries((current) => [
        ...current.filter((entry) => entry.name !== name),
        nextEntry,
      ]);
      toast.success("Zikr saved successfully!", {
        description: `${name} has been recorded.`,
      });
    } else {
      const data = await response.json().catch(() => ({}));
      toast.error("Failed to save zikr", {
        description: data.error || "Please try again.",
      });
    }
    setPending(null);
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">
            Daily ibadah
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Azkaar</h1>
          <p className="mt-1 text-sm text-foreground/60">Record your daily zikr</p>
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
            <label htmlFor="zikr-date" className="text-xs font-medium text-foreground/60">
              Or select specific date:
            </label>
            <input
              id="zikr-date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>
      </div>

      <div className={`space-y-4 ${loading ? "opacity-60" : ""}`}>
        {AZKAAR_TARGET_ITEMS.map(({ name }) => {
          const entry = entries.find((item) => item.name === name);
          const draft = drafts[name] ?? initialDraft(entry);
          const count = Number(draft.count);
          const hasValidCount = draft.mode === "KASRAT" || (Number.isInteger(count) && count > 0);
          const isPending = pending === name;

          return (
            <section key={name} className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold leading-6 text-foreground">{name}</h2>
                  <p className="mt-1 text-xs text-foreground/55">
                    {entry?.mode === "KASRAT" ? "Kasrat se saved" : `Today's count: ${entry?.count ?? 0}`}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${draft.mode === "COUNT" ? "border-primary-400 bg-primary-50" : "border-border hover:border-primary-100"}`}>
                  <input
                    type="radio"
                    name={`mode-${name}`}
                    checked={draft.mode === "COUNT"}
                    onChange={() => updateDraft(name, { mode: "COUNT" })}
                    className="h-4 w-4 accent-primary-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">Apna count</span>
                    <span className="block text-xs text-foreground/55">How many times?</span>
                  </span>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={draft.mode === "COUNT" ? draft.count : ""}
                    onChange={(event) => updateDraft(name, { count: event.target.value })}
                    onClick={(event) => event.stopPropagation()}
                    placeholder="0"
                    className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-right text-sm font-semibold text-foreground outline-none focus:border-primary-400"
                  />
                </label>

                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${draft.mode === "KASRAT" ? "border-gold-400 bg-gold-100" : "border-border hover:border-gold-400/60"}`}>
                  <input
                    type="radio"
                    name={`mode-${name}`}
                    checked={draft.mode === "KASRAT"}
                    onChange={() => updateDraft(name, { mode: "KASRAT" })}
                    className="h-4 w-4 accent-gold-500"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Kasrat se</span>
                    <span className="block text-xs text-foreground/55">More than 300</span>
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => saveEntry(name)}
                disabled={isPending || !hasValidCount}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  "Save Zikr"
                )}
              </button>
            </section>
          );
        })}
      </div>
    </div>
  );
}
