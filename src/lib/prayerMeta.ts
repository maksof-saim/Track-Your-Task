export const PRAYERS = [
  { key: "FAJR", label: "Fajr" },
  { key: "DHUHR", label: "Zuhr" },
  { key: "ASR", label: "Asr" },
  { key: "MAGHRIB", label: "Maghrib" },
  { key: "ISHA", label: "Isha" },
] as const;

export type PrayerKey = (typeof PRAYERS)[number]["key"];

export const STATUSES = [
  { key: "JAMAAT", label: "Jamaat", hint: "Masjid mein baa-jamaat" },
  { key: "INFRADI", label: "Infradi", hint: "Akele parhi" },
  { key: "QAZA", label: "Qaza", hint: "Waqt guzar gaya" },
] as const;

export type StatusKey = (typeof STATUSES)[number]["key"];

export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isoDateDaysAgo(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() - days);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
