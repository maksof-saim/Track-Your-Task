import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name must be less than 60 characters"),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, "Invalid reset token"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const PRAYER_NAMES = ["FAJR", "DHUHR", "ASR", "MAGHRIB", "ISHA"] as const;
export const PRAYER_STATUSES = ["JAMAAT", "INFRADI", "QAZA"] as const;

export const prayerLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  entries: z
    .array(
      z.object({
        prayer: z.enum(PRAYER_NAMES),
        status: z.enum(PRAYER_STATUSES),
      }),
    )
    .min(1, "At least one prayer entry is required"),
});

export const zikrLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  name: z.string().trim().min(1, "Zikr name is required").max(80, "Zikr name must be less than 80 characters"),
  mode: z.enum(["COUNT", "KASRAT"]),
  count: z.number().int().min(0, "Count must be a positive number").max(1000000, "Count must be less than 1,000,000"),
});

export const CHECKLIST_SECTIONS = ["TILAWAT", "HIFAZAT"] as const;

export const checklistLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  section: z.enum(CHECKLIST_SECTIONS),
  items: z
    .array(
      z.object({
        item: z.string().trim().min(1, "Item name is required").max(60, "Item name must be less than 60 characters"),
        done: z.boolean(),
      }),
    )
    .min(1, "At least one checklist item is required"),
});
