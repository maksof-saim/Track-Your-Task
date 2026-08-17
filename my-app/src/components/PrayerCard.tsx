"use client";

import { PRAYER_STATUSES, type PrayerName, type PrayerStatus } from "@/lib/types";

const ARABIC_NAMES: Record<PrayerName, string> = {
  Fajr: "الفجر",
  Zuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const STATUS_COLOR: Record<PrayerStatus, string> = {
  Jamaat: "border-jamaat text-jamaat",
  Infiraadi: "border-infiraadi text-infiraadi",
  Qaza: "border-qaza text-qaza",
};

interface PrayerCardProps {
  prayer: PrayerName;
  status: PrayerStatus | undefined;
  saving: boolean;
  onSelect: (prayer: PrayerName, status: PrayerStatus) => void;
}

export function PrayerCard({ prayer, status, saving, onSelect }: PrayerCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background-elevated p-5 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-foreground">{prayer}</h2>
        <span className="font-display text-xl text-muted" dir="rtl">
          {ARABIC_NAMES[prayer]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PRAYER_STATUSES.map((option) => {
          const isSelected = status === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(prayer, option)}
              disabled={saving}
              className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                isSelected
                  ? `${STATUS_COLOR[option]} bg-accent-soft`
                  : "border-border text-muted hover:text-foreground hover:border-muted"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted h-4">
        {status ? `Marked as ${status}` : "Not recorded yet"}
      </p>
    </div>
  );
}
