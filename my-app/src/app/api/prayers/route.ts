import { NextRequest, NextResponse } from "next/server";
import { getLogByDate, upsertEntry } from "@/lib/store";
import { PRAYER_NAMES, PRAYER_STATUSES, type PrayerName, type PrayerStatus } from "@/lib/types";

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/prayers?date=YYYY-MM-DD  -> returns that day's log (defaults to today)
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? todayString();
  const log = getLogByDate(date);

  return NextResponse.json({
    date,
    entries: log?.entries ?? {},
  });
}

// POST /api/prayers  { date, prayer, status } -> saves one prayer's status for that date
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const date: string = body.date ?? todayString();
  const prayer: PrayerName = body.prayer;
  const status: PrayerStatus = body.status;

  if (!PRAYER_NAMES.includes(prayer)) {
    return NextResponse.json({ error: "Unknown prayer name." }, { status: 400 });
  }
  if (!PRAYER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Date must be in YYYY-MM-DD format." }, { status: 400 });
  }

  const updatedLog = upsertEntry(date, prayer, status);
  return NextResponse.json(updatedLog);
}
