"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { todayISO, formatDisplayDate } from "@/lib/prayerMeta";
import { isFriday } from "@/lib/checklistMeta";
import { isFutureDate, getPreviousDay, getNextDay } from "@/lib/dateUtils";

type ChecklistItemDef = {
  key: string;
  label: string;
  fridayOnly?: boolean;
  hint?: string;
};

type CustomItem = { id: string; name: string; hint?: string | null };

const CUSTOM_CONFIG = {
  TILAWAT: {
    path: "/api/custom/tilawats",
    listKey: "customTilawats",
    heading: "My tilawat",
    placeholder: "Name of your tilawat",
  },
  HIFAZAT: {
    path: "/api/custom/hifazats",
    listKey: "customHifazats",
    heading: "My hifazat",
    placeholder: "Name of your hifazat item",
  },
} as const;

const customKey = (id: string) => `custom:${id}`;

function getJson(url: string) {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  });
}

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
  const { t } = useI18n();
  const metaItems = (section === "TILAWAT" ? t.meta.tilawat : t.meta.hifazat) as Record<
    string,
    { label: string; hint?: string }
  >;
  const itemLabel = (key: string) => metaItems[key]?.label;
  const itemHint = (key: string) => metaItems[key]?.hint;
  const config = {
    TILAWAT: {
      path: "/api/custom/tilawats",
      listKey: "customTilawats",
      heading: t.checklist.customHeadingTilawat ?? "My tilawat",
      placeholder: t.checklist.addCustomPlaceholderTilawat ?? "Name of your tilawat",
    },
    HIFAZAT: {
      path: "/api/custom/hifazats",
      listKey: "customHifazats",
      heading: t.checklist.customHeadingHifazat ?? "My hifazat",
      placeholder: t.checklist.addCustomPlaceholderHifazat ?? "Name of your hifazat item",
    },
  }[section];
  const [date, setDate] = useState(todayISO());
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [hasRecord, setHasRecord] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  function handleDateChange(newDate: string) {
    if (isFutureDate(newDate)) {
      toast.error(t.checklist.toast.futureDate, {
        description: t.checklist.toast.futureDateHint,
      });
      return;
    }
    setDate(newDate);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const { path, listKey } = CUSTOM_CONFIG[section];

    Promise.all([
      getJson(`/api/checklist?date=${date}&section=${section}`),
      getJson(path),
    ])
      .then(([checklist, customData]) => {
        if (cancelled) return;

        const saved: { item: string; done: boolean }[] = checklist.items ?? [];
        const map: Record<string, boolean> = {};
        for (const entry of saved) {
          map[entry.item] = entry.done;
        }

        setDone(map);
        setHasRecord(saved.length > 0);
        setCustomItems(
          (customData[listKey] ?? []).map((item: { id: string; name: string; hint?: string | null }) => ({
            id: item.id,
            name: item.name,
            hint: item.hint,
          })),
        );
      })
      .catch(() => {
        if (cancelled) return;
        // Clear the old date's values so they cannot be saved under the new date by mistake.
        setDone({});
        setHasRecord(false);
        toast.error(t.checklist.toast.loadFail, {
          description: t.checklist.toast.loadFailHint,
        });
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

  async function addCustomItem(event: FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      toast.error(t.checklist.toast.noName);
      return;
    }

    setAdding(true);
    try {
      const res = await fetch(config.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(t.checklist.toast.addFail, { description: data.error || t.checklist.toast.addFailHint });
        return;
      }

      setCustomItems((prev) => [...prev, { id: data.id, name: data.name, hint: data.hint }]);
      setNewName("");
      toast.success(t.checklist.toast.addSuccess, { description: data.name });
    } catch {
      toast.error(t.checklist.toast.addFail, {
        description: t.checklist.toast.addFailHint,
      });
    } finally {
      setAdding(false);
    }
  }

  async function removeCustomItem(item: CustomItem) {
    const confirmed = window.confirm(t.checklist.removeConfirm(item.name));
    if (!confirmed) return;

    try {
      const res = await fetch(`${config.path}/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(t.checklist.toast.removeFail, { description: t.checklist.toast.removeFailHint });
        return;
      }

      setCustomItems((prev) => prev.filter((entry) => entry.id !== item.id));
      setDone((prev) => {
        const next = { ...prev };
        delete next[customKey(item.id)];
        return next;
      });
      toast.success(t.checklist.toast.removeSuccess);
    } catch {
      toast.error(t.checklist.toast.removeFail, {
        description: t.checklist.toast.removeFailHint,
      });
    }
  }

  async function clearRecord() {
    const confirmed = window.confirm(
      t.checklist.clearRecordConfirm,
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/checklist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, section, clearAll: true }),
      });
      if (!res.ok) {
        toast.error(t.checklist.toast.clearFail, { description: t.checklist.toast.clearFailHint });
        return;
      }
      setDone({});
      setHasRecord(false);
      toast.success(t.checklist.toast.clear);
    } catch {
      toast.error(t.checklist.toast.clearFail, {
        description: t.checklist.toast.clearFailHint,
      });
    }
  }

  async function handleSave() {
    const checkedCount =
      items.filter((i) => done[i.key]).length +
      customItems.filter((c) => done[customKey(c.id)]).length;

    // A first save needs at least one item. If a record already exists, saving with
    // everything unchecked is allowed, so a mistake can be corrected.
    if (checkedCount === 0 && !hasRecord) {
      toast.error(t.checklist.toast.noItem, {
        description: t.checklist.toast.noItemHint(section),
      });
      return;
    }

    setSaving(true);

    try {
      const requests: Promise<Response>[] = [
        fetch("/api/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            section,
            items: items.map((i) => ({ item: i.key, done: Boolean(done[i.key]) })),
          }),
        }),
      ];

      if (customItems.length > 0) {
        requests.push(
          fetch("/api/checklist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date,
              section,
              customItems: customItems.map((c) => ({
                customId: c.id,
                done: Boolean(done[customKey(c.id)]),
              })),
            }),
          }),
        );
      }

      const responses = await Promise.all(requests);
      const failed = responses.find((res) => !res.ok);

      if (failed) {
        const data = await failed.json().catch(() => ({}));
        toast.error(t.checklist.toast.failed, {
          description: data.error || t.checklist.toast.failedHint,
        });
        return;
      }

      toast.success(t.checklist.toast.saved(title), {
        description: t.checklist.toast.savedHint,
      });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      toast.error(t.checklist.toast.failed, {
        description: t.checklist.toast.failedHint,
      });
    } finally {
      setSaving(false);
    }
  }

  const friday = isFriday(date);
  const activeItems = items.filter((i) => !(i.fridayOnly && !friday));
  const doneCount =
    activeItems.filter((i) => done[i.key]).length +
    customItems.filter((c) => done[customKey(c.id)]).length;
  const totalCount = activeItems.length + customItems.length;

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
                <p className="text-xs font-medium text-foreground/60">{t.checklist.selectedDateLabel}</p>
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
            <label htmlFor="checklist-date" className="text-xs font-medium text-foreground/60">
              {t.checklist.hintLabel}
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

      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted ps-4 pe-2.5 text-sm text-foreground/70">
        <span>{t.checklist.recordedCount(doneCount, totalCount)}</span>
        {hasRecord && (
          <button
            type="button"
            onClick={clearRecord}
            className="text-xs font-medium text-foreground/50 hover:text-status-qaza hover:underline"
          >
            {t.checklist.clearRecord}
          </button>
        )}
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
                <span className="font-medium text-foreground">{itemLabel(item.key) ?? item.label}</span>
                {item.fridayOnly && (
                  <span className="ms-2 rounded-full bg-gold-100 ps-2 pe-0.5 text-[11px] font-medium text-gold-600">
                    {t.checklist.fridayOnly}
                  </span>
                )}
                {(itemHint(item.key) ?? item.hint) && (
                  <p className="text-xs text-foreground/50">{itemHint(item.key) ?? item.hint}</p>
                )}
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

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">{config.heading}</h2>
        <p className="mb-3 mt-1 text-sm text-foreground/60">
          {t.checklist.addOwnItemsHint}
        </p>

        <form onSubmit={addCustomItem} className="mb-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            maxLength={100}
            placeholder={config.placeholder}
            aria-label={config.placeholder}
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="submit"
            disabled={adding}
            className="shrink-0 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adding ? t.checklist.addButton.adding : t.checklist.addButton.default}
          </button>
        </form>

        <div className={`flex flex-col gap-2 ${loading ? "opacity-50" : ""}`}>
          {customItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface p-4"
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="break-words font-medium text-foreground">{item.name}</span>
                  {item.hint && <p className="text-xs text-foreground/50">{item.hint}</p>}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(done[customKey(item.id)])}
                  onChange={() => toggle(customKey(item.id))}
                  className="h-5 w-5 shrink-0 rounded border-border text-primary-500 focus:ring-primary-300"
                />
              </label>
              <button
                type="button"
                onClick={() => removeCustomItem(item)}
                className="shrink-0 rounded-lg ps-2 pe-1 text-xs font-medium text-status-qaza hover:underline"
              >
                {t.checklist.removeButton}
              </button>
            </div>
          ))}
        </div>
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
              {t.checklist.saveButton.saving}
            </>
          ) : (
            t.checklist.saveButton.saved(title)
          )}
        </button>
      </div>
    </div>
  );
}