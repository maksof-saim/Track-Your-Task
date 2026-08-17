import fs from "fs";
import path from "path";
import type { DailyLog, PrayerName, PrayerStatus } from "./types";

// Simple JSON-file-backed store. Good enough for a single-user MVP.
// Swap this file out later for a real database without touching the API routes' shapes.

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "prayer-logs.json");

function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

function readAll(): DailyLog[] {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw) as DailyLog[];
  } catch {
    return [];
  }
}

function writeAll(logs: DailyLog[]): void {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2), "utf-8");
}

export function getLogByDate(date: string): DailyLog | undefined {
  return readAll().find((log) => log.date === date);
}

export function getAllLogs(): DailyLog[] {
  return readAll().sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function upsertEntry(
  date: string,
  prayer: PrayerName,
  status: PrayerStatus
): DailyLog {
  const logs = readAll();
  const existingIndex = logs.findIndex((log) => log.date === date);
  const now = new Date().toISOString();

  if (existingIndex === -1) {
    const newLog: DailyLog = {
      date,
      entries: { [prayer]: status },
      updatedAt: now,
    };
    logs.push(newLog);
    writeAll(logs);
    return newLog;
  }

  const updated: DailyLog = {
    ...logs[existingIndex],
    entries: { ...logs[existingIndex].entries, [prayer]: status },
    updatedAt: now,
  };
  logs[existingIndex] = updated;
  writeAll(logs);
  return updated;
}
