import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Naam kam se kam 2 harf ka ho").max(60),
  email: z.string().trim().toLowerCase().email("Sahi email likhein"),
  password: z.string().min(6, "Password kam se kam 6 harf ka ho"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Sahi email likhein"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8, "Password kam se kam 8 harf ka ho"),
});

export const PRAYER_NAMES = ["FAJR", "DHUHR", "ASR", "MAGHRIB", "ISHA"] as const;
export const PRAYER_STATUSES = ["JAMAAT", "INFRADI", "QAZA"] as const;

export const prayerLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sahi date format YYYY-MM-DD"),
  entries: z
    .array(
      z.object({
        prayer: z.enum(PRAYER_NAMES),
        status: z.enum(PRAYER_STATUSES),
      }),
    )
    .min(1),
});

export const zikrLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sahi date format YYYY-MM-DD"),
  name: z.string().trim().min(1).max(80),
  mode: z.enum(["COUNT", "KASRAT"]),
  count: z.number().int().min(0).max(1000000),
});

export const CHECKLIST_SECTIONS = ["TILAWAT", "HIFAZAT"] as const;

export const checklistLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sahi date format YYYY-MM-DD"),
  section: z.enum(CHECKLIST_SECTIONS),
  items: z
    .array(
      z.object({
        item: z.string().trim().min(1).max(60),
        done: z.boolean(),
      }),
    )
    .min(1),
});
