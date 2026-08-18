export const TILAWAT_ITEMS = [
  { key: "QURAN_TILAWAT", label: "Quran ki Tilawat" },
  { key: "SURAH_YASEEN", label: "Surah Yaseen" },
  { key: "SURAH_WAQIAH", label: "Surah Waqiah" },
  { key: "SURAH_MULK", label: "Surah Mulk" },
  { key: "SURAH_KAHF", label: "Surah Kahf", fridayOnly: true },
] as const;

export const HIFAZAT_ITEMS = [
  { key: "NAZAR", label: "Nazar ki Hifazat", hint: "Ghair mahram ko dekhne se bachna" },
  { key: "KAAN", label: "Kaan ki Hifazat", hint: "Ghibat, gaana wagera sunne se bachna" },
  { key: "ZABAN", label: "Zaban ki Hifazat", hint: "Jhoot, ghibat, fuzool baaton se bachna" },
] as const;

export const AZKAAR_TARGET_ITEMS = [
  { name: "Astaghfar", target: 100 },
  { name: "Durood Shareef", target: 100 },
  { name: "La ilaha illallah", target: 100 },
  { name: "SubhanAllah Walhamdulillah Wa La ilaha illallah Wallahu Akbar", target: 100 },
] as const;

export type ChecklistItemKey =
  | (typeof TILAWAT_ITEMS)[number]["key"]
  | (typeof HIFAZAT_ITEMS)[number]["key"];

export function isFriday(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() === 5;
}
