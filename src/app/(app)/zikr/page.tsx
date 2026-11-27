"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { todayISO, formatDisplayDate } from "@/lib/prayerMeta";
import { AZKAAR_TARGET_ITEMS } from "@/lib/checklistMeta";
import { isFutureDate, getPreviousDay, getNextDay } from "@/lib/dateUtils";
import { useI18n } from "@/lib/i18n/client";

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
  const { t } = useI18n();
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
      toast.error(t.zikr.toast.futureDate, {
        description: t.zikr.toast.futureDateHint,
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
        toast.error(t.zikr.toast.loadFail, {
          description: t.zikr.toast.loadFailHint,
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
      toast.error(t.zikr.toast.noName);
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
        toast.error(t.zikr.toast.addFail, { description: data.error || t.zikr.toast.addFailHint });
        return;
      }

      setCustomZikrs((current) => [...current, { id: data.id, name: data.name }]);
      setDrafts((current) => ({ ...current, [customKey(data.id)]: initialDraft() }));
      setNewName("");
      toast.success(t.zikr.toast.addSuccess, { description: data.name });
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
        toast.error(t.zikr.toast.removeFail, { description: t.zikr.toast.removeFailHint });
        return;
      }

      setCustomZikrs((current) => current.filter((item) => item.id !== custom.id));
      setDrafts((current) => {
        const next = { ...current };
        delete next[customKey(custom.id)];
        return next;
      });
      setEntries((current) => current.filter((entry) => entry.name !== custom.name));
      toast.success(t.zikr.toast.removeSuccess);
    } catch {
      toast.error("Could not remove zikr", {
        description: "Please check your internet connection and try again.",
      });
    }
  }

  async function clearZikr(body: { name?: string; customZikrId?: string }) {
    try {
      const response = await fetch("/api/zikr", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, ...body }),
      });
      if (!response.ok) {
        toast.error(t.zikr.toast.clearFail, { description: t.zikr.toast.clearFailHint });
        return;
      }

      if (body.name) {
        const name = body.name;
        setEntries((current) => current.filter((entry) => entry.name !== name));
        setDrafts((current) => ({ ...current, [name]: initialDraft() }));
      }
      if (body.customZikrId) {
        const customZikrId = body.customZikrId;
        const custom = customZikrs.find((item) => item.id === customZikrId);
        setEntries((current) =>
          current.filter((entry) => (custom ? entry.name !== custom.name : true)),
        );
        setDrafts((current) => ({ ...current, [customKey(customZikrId)]: initialDraft() }));
      }
      toast.success(t.zikr.toast.clear);
    } catch {
      toast.error("Could not clear zikr", {
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
      toast.error(t.zikr.toast.noToSave, {
        description: t.zikr.toast.noToSaveHint,
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

      toast.success(t.zikr.toast.saved, {
        description: t.zikr.toast.savedHint(total),
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : t.zikr.toast.failedHint;
      toast.error(t.zikr.toast.failed, { description: message });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">
            {t.zikr.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.zikr.title}</h1>
          <p className="mt-1 text-sm text-foreground/60">{t.zikr.subtitle}</p>
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
                <p className="text-xs font-medium text-foreground/60">{t.zikr.selectedDateLabel}</p>
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
            <label htmlFor="zikr-date" className="text-xs font-medium text-foreground/60">
              {t.zikr.selectDateHint}
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
              onClear={entry ? () => clearZikr({ name }) : undefined}
            />
          );
        })}

        <div className="pt-4">
          <h2 className="text-lg font-semibold text-foreground">{t.zikr.myAzkaar}</h2>
          <p className="mb-3 mt-1 text-sm text-foreground/60">
            {t.zikr.addZikrHint}
          </p>

          <form onSubmit={addCustomZikr} className="mb-4 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              maxLength={100}
              placeholder={t.zikr.zikrPlaceholder}
              aria-label={t.zikr.zikrPlaceholder}
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
                  onClear={entry ? () => clearZikr({ customZikrId: custom.id }) : undefined}
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
              {t.zikr.saveButton.saving}
              </>
            ) : (
              t.zikr.saveButton.default
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
  onClear,
  onRemove,
}: {
  id: string;
  title: string;
  entry?: ZikrEntry;
  draft: Draft;
  onChange: (changes: Partial<Draft>) => void;
  onClear?: () => void;
  onRemove?: () => void;
}) {
  const { t } = useI18n();
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-xs text-foreground/55">
            {entry?.mode === "KASRAT" ? t.zikr.kasratSaved : t.zikr.todayCount(entry?.count ?? 0)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onClear && (
                          <button
                type="button"
                onClick={onClear}
                className="rounded-lg px-2 py-1 text-xs font-medium text-foreground/50 hover:text-status-qaza hover:underline"
              >
                {t.zikr.clear}
              </button>
          )}
          {onRemove && (
                          <button
                type="button"
                onClick={onRemove}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-status-qaza hover:underline"
              >
                {t.zikr.remove}
              </button>
          )}
        </div>
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
            <span className="block text-sm font-medium text-foreground">{t.zikr.cancelLabel}</span>
            <span className="block text-xs text-foreground/55">{t.zikr.cancelHint}</span>
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
            <span className="block text-sm font-medium text-foreground">{t.zikr.kasratLabel}</span>
            <span className="block text-xs text-foreground/55">{t.zikr.kasratHint}</span>
          </span>
        </label>
      </div>
    </section>
  );
}