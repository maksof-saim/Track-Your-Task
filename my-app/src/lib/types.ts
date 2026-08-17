export type PrayerName = "Fajr" | "Zuhr" | "Asr" | "Maghrib" | "Isha";

export type PrayerStatus = "Infiraadi" | "Jamaat" | "Qaza";

export const PRAYER_NAMES: PrayerName[] = [
  "Fajr",
  "Zuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

export const PRAYER_STATUSES: PrayerStatus[] = [
  "Infiraadi",
  "Jamaat",
  "Qaza",
];

// One record per day, holding the status chosen for each of the 5 prayers.
export interface DailyLog {
  date: string; // YYYY-MM-DD
  entries: Partial<Record<PrayerName, PrayerStatus>>;
  updatedAt: string; // ISO timestamp
}
