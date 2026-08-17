"use client";

import { useEffect, useState } from "react";
import { PrayerCard } from "@/components/PrayerCard";
import { StarMotif } from "@/components/StarMotif";
import { PRAYER_NAMES, type PrayerName, type PrayerStatus } from "@/lib/types";

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function prettyDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Home() {
  const [date] = useState(todayString());
  const [entries, setEntries] = useState<Partial<Record<PrayerName, PrayerStatus>>>({});
  const [loading, setLoading] = useState(true);
  const [savingPrayer, setSavingPrayer] = useState<PrayerName | null>(null);

  useEffect(() => {
    fetch(`/api/prayers?date=${date}`)
      .then((res) => res.json())
      .then((data) => setEntries(data.entries ?? {}))
      .finally(() => setLoading(false));
  }, [date]);

  async function handleSelect(prayer: PrayerName, status: PrayerStatus) {
    setSavingPrayer(prayer);
    setEntries((prev) => ({ ...prev, [prayer]: status }));

    try {
      await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, prayer, status }),
      });
    } finally {
      setSavingPrayer(null);
    }
  }

  const recordedCount = Object.keys(entries).length;

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-10 relative">
          <StarMotif className="w-10 h-10 text-accent mx-auto mb-4 opacity-80" />
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-2">
            Amaal Tracker
          </h1>
          <p className="text-muted">Apni panchon namazon ka roz ka hisaab rakhein</p>
          <p className="text-sm text-accent mt-3">{prettyDate(date)}</p>
        </header>

        {loading ? (
          <p className="text-center text-muted">Loading...</p>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <span className="text-xs uppercase tracking-wide text-muted border border-border rounded-full px-3 py-1">
                {recordedCount} / {PRAYER_NAMES.length} recorded today
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PRAYER_NAMES.map((prayer) => (
                <PrayerCard
                  key={prayer}
                  prayer={prayer}
                  status={entries[prayer]}
                  saving={savingPrayer === prayer}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </>
        )}

        <footer className="mt-14 flex items-center justify-center gap-3 text-muted">
          <StarMotif className="w-4 h-4" />
          <p className="text-xs">Selection auto-saves — koi submit button ki zaroorat nahi</p>
          <StarMotif className="w-4 h-4" />
        </footer>
      </div>
    </main>
  );
}
