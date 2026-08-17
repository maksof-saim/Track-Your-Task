"use client";

import { PRAYER_STATUSES, type PrayerName, type PrayerStatus } from "@/lib/types";

const ARABIC_NAMES: Record<PrayerName, string> = {
  Fajr: "الفجر",
  Zuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const STATUS_STYLES: Record<PrayerStatus, string> = {
  Jamaat: "border-jamaat/70 text-jamaat bg-jamaat/10",
  Infiraadi: "border-infiraadi/70 text-infiraadi bg-infiraadi/10",
  Qaza: "border-qaza/70 text-qaza bg-qaza/10",
};

interface PrayerCardProps {
  prayer: PrayerName;
  status: PrayerStatus | undefined;
  saving: boolean;
  onSelect: (prayer: PrayerName, status: PrayerStatus) => void;
}

export function PrayerCard({ prayer, status, saving, onSelect }: PrayerCardProps) {
  return (
    <div className="relative rounded-2xl border border-border bg-background-elevated p-5 flex flex-col gap-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* gold top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-70" />

      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-foreground">{prayer}</h2>
        <span className="font-display text-xl text-accent/80" dir="rtl">
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
              className={`rounded-lg border px-2 py-2 text-sm font-medium transition-all duration-150 disabled:opacity-50 ${
                isSelected
                  ? `${STATUS_STYLES[option]} shadow-inner`
                  : "border-border/80 text-muted hover:text-foreground hover:border-accent/40 hover:bg-white/[0.02]"
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
