"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { todayISO, formatDisplayDate } from "@/lib/prayerMeta";
import { AZKAAR_TARGET_ITEMS } from "@/lib/checklistMeta";
import { isFutureDate, getPreviousDay, getNextDay } from "@/lib/dateUtils";

type ZikrMode = "COUNT" | "KASRAT";
type ZikrEntry = { name: string; count: number; mode: ZikrMode };
type CustomZikr = { id: string; name: string };
type Draft = { mode: ZikrMode; count: string };

const initialDraft = (entry?: ZikrEntry): Draft => ({
  mode: entry?.mode ?? "COUNT",
  count: entry ? String(entry.count) : "",
});

const customKey = (id: string) => `custom:${id}`;

function buildDrafts(entries: ZikrEntry[], customs: CustomZikr[]): Record<string, Draft> {
  const result: Record<string, Draft> = {};
  for (const { name } of AZKAAR_TARGET_ITEMS) {
    result[name] = initialDraft(entries.find((entry) => entry.name === name));
  }
  for (const custom of customs) {
    result[customKey(custom.id)] = initialDraft(entries.find((entry) => entry.name === custom.name));
  }
  return result;
}

function parseDraft(draft: Draft): { mode: ZikrMode; count: number } | null {
  if (draft.mode === "KASRAT") return { mode: "KASRAT", count: 0 };
  if (draft.count.trim() === "") return null;
  const count = Number(draft.count);
  if (!Number.isInteger(count) || count < 0 || count > 1000000) return null;
  return { mode: "COUNT", count };
}

export default function ZikrPage() {
  const [date, setDate] = useState(todayISO());
  const [entries, setEntries] = useState<ZikrEntry[]>([]);
  const [customZikrs, setCustomZikrs] = useState<CustomZikr[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

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
    setLoading(true);

    Promise.all([
      fetch(`/api/zikr?date=${date}`).then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      }),
      fetch("/api/custom/zikrs").then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      }),
    ])
      .then(([zikrData, customData]) => {
        if (cancelled) return;
        const nextEntries: ZikrEntry[] = zikrData.entries ?? [];
        const nextCustoms: CustomZikr[] = (customData.customZikrs ?? []).map(
          (item: { id: string; name: string }) => ({ id: item.id, name: item.name }),
        );
        setEntries(nextEntries);
        setCustomZikrs(nextCustoms);
        setDrafts(buildDrafts(nextEntries, nextCustoms));
      })
      .catch(() => {
        if (cancelled) return;
        // Clear the old date's values so they cannot be saved under the new date by mistake.
        setEntries([]);
        setDrafts(buildDrafts([], []));
        toast.error("Could not load your zikr", {
          description: "Please check your internet connection and refresh the page.",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  function updateDraft(key: string, changes: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [key]: { ...(current[key] ?? initialDraft()), ...changes },
    }));
  }

  async function addCustomZikr(event: FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      toast.error("Please enter a name for your zikr");
      return;
    }

    setAdding(true);
    try {
      const response = await fetch("/api/custom/zikrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error("Could not add zikr", { description: data.error || "Please try again." });
        return;
      }

      setCustomZikrs((current) => [...current, { id: data.id, name: data.name }]);
      setDrafts((current) => ({ ...current, [customKey(data.id)]: initialDraft() }));
      setNewName("");
      toast.success("Zikr added", { description: data.name });
    } catch {
      toast.error("Could not add zikr", {
        description: "Please check your internet connection and try again.",
      });
    } finally {
      setAdding(false);
    }
  }

  async function removeCustomZikr(custom: CustomZikr) {
    const confirmed = window.confirm(
      `Remove "${custom.name}"? Its saved records will also be deleted.`,
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/custom/zikrs/${custom.id}`, { method: "DELETE" });
      if (!response.ok) {
        toast.error("Could not remove zikr", { description: "Please try again." });
        return;
      }

      setCustomZikrs((current) => current.filter((item) => item.id !== custom.id));
      setDrafts((current) => {
        const next = { ...current };
        delete next[customKey(custom.id)];
        return next;
      });
      setEntries((current) => current.filter((entry) => entry.name !== custom.name));
      toast.success("Zikr removed");
    } catch {
      toast.error("Could not remove zikr", {
        description: "Please check your internet connection and try again.",
      });
    }
  }

  async function saveAll() {
    const builtIn = AZKAAR_TARGET_ITEMS.flatMap(({ name }) => {
      const parsed = parseDraft(drafts[name] ?? initialDraft());
      return parsed ? [{ name, ...parsed }] : [];
    });
    const custom = customZikrs.flatMap((item) => {
      const parsed = parseDraft(drafts[customKey(item.id)] ?? initialDraft());
      return parsed ? [{ customZikrId: item.id, ...parsed }] : [];
    });

    const total = builtIn.length + custom.length;
    if (total === 0) {
      toast.error("No zikr to save", {
        description: "Please enter at least one zikr count.",
      });
      return;
    }

    setPending("all");

    try {
      if (builtIn.length > 0) {
        const response = await fetch("/api/zikr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, entries: builtIn }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Please try again.");
        }
      }

      for (const item of custom) {
        const response = await fetch("/api/zikr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, ...item }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Please try again.");
        }
      }

      const refreshed = await fetch(`/api/zikr?date=${date}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);
      if (refreshed?.entries) setEntries(refreshed.entries);

      toast.success("All zikr saved successfully!", {
        description: `${total} zikr recorded.`,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : "Please try again.";
      toast.error("Failed to save zikr", { description: message });
    } finally {
      setPending(null);
    }
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
          return (
            <ZikrCard
              key={name}
              id={name}
              title={name}
              entry={entry}
              draft={drafts[name] ?? initialDraft(entry)}
              onChange={(changes) => updateDraft(name, changes)}
            />
          );
        })}

        <div className="pt-4">
          <h2 className="text-lg font-semibold text-foreground">My azkaar</h2>
          <p className="mb-3 mt-1 text-sm text-foreground/60">
            Add your own zikr to record alongside the daily azkaar.
          </p>

          <form onSubmit={addCustomZikr} className="mb-4 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              maxLength={100}
              placeholder="Name of your zikr"
              aria-label="Name of your zikr"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <button
              type="submit"
              disabled={adding}
              className="shrink-0 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </form>

          <div className="space-y-4">
            {customZikrs.map((custom) => {
              const entry = entries.find((item) => item.name === custom.name);
              const key = customKey(custom.id);
              return (
                <ZikrCard
                  key={custom.id}
                  id={key}
                  title={custom.name}
                  entry={entry}
                  draft={drafts[key] ?? initialDraft(entry)}
                  onChange={(changes) => updateDraft(key, changes)}
                  onRemove={() => removeCustomZikr(custom)}
                />
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface/95 pt-4 backdrop-blur">
          <button
            type="button"
            onClick={saveAll}
            disabled={pending === "all" || loading}
            className="flex w-full items-center justify-center rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
          >
            {pending === "all" ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              "Save All Zikr"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ZikrCard({
  id,
  title,
  entry,
  draft,
  onChange,
  onRemove,
}: {
  id: string;
  title: string;
  entry?: ZikrEntry;
  draft: Draft;
  onChange: (changes: Partial<Draft>) => void;
  onRemove?: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-xs text-foreground/55">
            {entry?.mode === "KASRAT" ? "Kasrat se saved" : `Today's count: ${entry?.count ?? 0}`}
          </p>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-status-qaza hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${draft.mode === "COUNT" ? "border-primary-400 bg-primary-50" : "border-border hover:border-primary-100"}`}>
          <input
            type="radio"
            name={`mode-${id}`}
            checked={draft.mode === "COUNT"}
            onChange={() => onChange({ mode: "COUNT" })}
            className="h-4 w-4 accent-primary-500"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-foreground">Apna count</span>
            <span className="block text-xs text-foreground/55">How many times?</span>
          </span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={draft.mode === "COUNT" ? draft.count : ""}
            onChange={(event) => onChange({ count: event.target.value })}
            onClick={(event) => event.stopPropagation()}
            placeholder="0"
            className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-right text-sm font-semibold text-foreground outline-none focus:border-primary-400"
          />
        </label>

        <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${draft.mode === "KASRAT" ? "border-primary-400 bg-primary-50" : "border-border hover:border-primary-100"}`}>
          <input
            type="radio"
            name={`mode-${id}`}
            checked={draft.mode === "KASRAT"}
            onChange={() => onChange({ mode: "KASRAT" })}
            className="h-4 w-4 accent-primary-500"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">Kasrat se</span>
            <span className="block text-xs text-foreground/55">More than 300</span>
          </span>
        </label>
      </div>
    </section>
  );
}