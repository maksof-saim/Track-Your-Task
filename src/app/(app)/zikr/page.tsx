"use client";

import { useEffect, useState } from "react";
import { todayISO, formatDisplayDate } from "@/lib/prayerMeta";
import { AZKAAR_TARGET_ITEMS } from "@/lib/checklistMeta";

const PRESET_ZIKR: string[] = AZKAAR_TARGET_ITEMS.map((z) => z.name);

const QUICK_ADD = [1, 10, 33, 100];

type ZikrEntry = { name: string; count: number };

export default function ZikrPage() {
  const [date] = useState(todayISO());
  const [entries, setEntries] = useState<ZikrEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [customName, setCustomName] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  function loadEntries() {
    fetch(`/api/zikr?date=${date}`)
      .then((res) => res.json())
      .then((data) => setEntries(data.entries ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function addCount(name: string, delta: number) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPending(trimmed);

    const current = entries.find((e) => e.name === trimmed)?.count ?? 0;
    setEntries((prev) => {
      const exists = prev.some((e) => e.name === trimmed);
      const nextCount = Math.max(0, current + delta);
      if (exists) {
        return prev.map((e) => (e.name === trimmed ? { ...e, count: nextCount } : e));
      }
      return [{ name: trimmed, count: nextCount }, ...prev];
    });

    await fetch("/api/zikr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, name: trimmed, delta }),
    });
    setPending(null);
  }

  const totalToday = entries.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Azkaar</h1>
        <p className="text-sm text-foreground/60">{formatDisplayDate(date)} ka zikr record karein</p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm text-foreground/70">
        Aaj ka total zikr:{" "}
        <span className="font-semibold text-primary-500">{totalToday}</span>
      </div>

      <div className={`flex flex-col gap-3 ${loading ? "opacity-50" : ""}`}>
        {AZKAAR_TARGET_ITEMS.map(({ name, target }) => {
          const count = entries.find((e) => e.name === name)?.count ?? 0;
          const reached = count >= target;
          return (
            <div
              key={name}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {name}{" "}
                  {reached && (
                    <span className="ml-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-600">
                      ✓ {target} mukammal
                    </span>
                  )}
                </p>
                <p className="mb-1.5 text-xs text-foreground/50">
                  Aaj: {count} / {target}
                </p>
                <div className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-primary-400 transition-all"
                    style={{ width: `${Math.min(100, (count / target) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_ADD.map((n) => (
                  <button
                    key={n}
                    onClick={() => addCount(name, n)}
                    disabled={pending === name}
                    className="rounded-lg border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-100 disabled:opacity-60"
                  >
                    +{n}
                  </button>
                ))}
                <button
                  onClick={() => addCount(name, -1)}
                  disabled={pending === name || count === 0}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground/60 transition-colors hover:border-status-qaza hover:text-status-qaza disabled:opacity-40"
                >
                  Reset -1
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-border bg-surface p-4">
        <p className="mb-2 text-sm font-medium text-foreground/80">Apna zikr add karein</p>
        <div className="flex gap-2">
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Zikr ka naam likhein"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400"
          />
          <button
            onClick={() => {
              addCount(customName, 1);
              setCustomName("");
            }}
            disabled={!customName.trim()}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            +1
          </button>
        </div>
      </div>

      {entries.some((e) => !PRESET_ZIKR.includes(e.name)) && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-foreground/80">Custom zikr</p>
          <div className="flex flex-col gap-2">
            {entries
              .filter((e) => !PRESET_ZIKR.includes(e.name))
              .map((e) => (
                <div
                  key={e.name}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
                >
                  <span className="text-sm text-foreground">{e.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary-500">{e.count}</span>
                    <button
                      onClick={() => addCount(e.name, 1)}
                      className="rounded-lg border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-100"
                    >
                      +1
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
