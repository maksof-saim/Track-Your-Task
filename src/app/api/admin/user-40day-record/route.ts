import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 40-day challenge period
const CHALLENGE_START = "2026-09-21";
const CHALLENGE_END = "2026-10-31";

// Retry helper function for database operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2,
  delayMs = 500
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries} after ${delayMs}ms`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      delayMs *= 2; // Exponential backoff
    }
  }
  throw new Error("Max retries exceeded");
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // Get user info
  const user = await withRetry(() =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get all prayer logs for the 40-day period
  const prayerLogs = await withRetry(() =>
    prisma.prayerLog.findMany({
      where: {
        userId,
        date: {
          gte: new Date(`${CHALLENGE_START}T00:00:00.000`),
          lte: new Date(`${CHALLENGE_END}T23:59:59.999`),
        },
        customPrayerId: null,
      },
      orderBy: { date: "asc" },
    })
  );

  // Get zikr logs for the 40-day period
  const zikrLogs = await withRetry(() =>
    prisma.zikrLog.findMany({
      where: {
        userId,
        date: {
          gte: new Date(`${CHALLENGE_START}T00:00:00.000`),
          lte: new Date(`${CHALLENGE_END}T23:59:59.999`),
        },
        customZikrId: null,
      },
      orderBy: { date: "asc" },
    })
  );

  // Get checklist logs for the 40-day period
  const checklistLogs = await withRetry(() =>
    prisma.checklistLog.findMany({
      where: {
        userId,
        date: {
          gte: new Date(`${CHALLENGE_START}T00:00:00.000`),
          lte: new Date(`${CHALLENGE_END}T23:59:59.999`),
        },
        customTilawatId: null,
        customHifazatId: null,
      },
      orderBy: { date: "asc" },
    })
  );

  // Group records by date
  const recordsByDate = new Map<string, any>();

  // Initialize all 40 days
  const startDate = new Date(CHALLENGE_START);
  const endDate = new Date(CHALLENGE_END);
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const isoDate = currentDate.toISOString().slice(0, 10);
    recordsByDate.set(isoDate, {
      date: isoDate,
      prayers: {},
      zikr: [],
      tilawat: [],
      hifazat: [],
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Fill prayer data
  for (const log of prayerLogs) {
    const isoDate = log.date.toISOString().slice(0, 10);
    if (recordsByDate.has(isoDate) && log.prayer) {
      recordsByDate.get(isoDate)!.prayers[log.prayer] = log.status;
    }
  }

  // Fill zikr data
  for (const log of zikrLogs) {
    const isoDate = log.date.toISOString().slice(0, 10);
    if (recordsByDate.has(isoDate)) {
      recordsByDate.get(isoDate).zikr.push({
        name: log.name,
        count: log.count,
        mode: log.mode,
      });
    }
  }

  // Fill checklist data
  for (const log of checklistLogs) {
    const isoDate = log.date.toISOString().slice(0, 10);
    if (recordsByDate.has(isoDate)) {
      if (log.section === "TILAWAT") {
        recordsByDate.get(isoDate).tilawat.push({ item: log.item, done: log.done });
      } else if (log.section === "HIFAZAT") {
        recordsByDate.get(isoDate).hifazat.push({ item: log.item, done: log.done });
      }
    }
  }

  const records = Array.from(recordsByDate.values());

  // Calculate stats
  let totalPrayers = 0;
  let jamaatCount = 0;
  let infradiCount = 0;
  let qazaCount = 0;
  let totalZikr = 0;
  let totalTilawat = 0;
  let totalHifazat = 0;
  let daysWithRecords = 0;

  for (const record of records) {
    const prayerCount = Object.keys(record.prayers).length;
    if (prayerCount > 0) {
      daysWithRecords++;
      totalPrayers += prayerCount;
      for (const status of Object.values(record.prayers)) {
        if (status === "JAMAAT") jamaatCount++;
        else if (status === "INFRADI") infradiCount++;
        else if (status === "QAZA") qazaCount++;
      }
    }
    // Only count zikr if mode is COUNT, not KASRAT
    totalZikr += record.zikr.reduce((sum: number, z: any) => sum + (z.mode === 'COUNT' ? z.count : 0), 0);
    totalTilawat += record.tilawat.filter((t: any) => t.done).length;
    totalHifazat += record.hifazat.filter((h: any) => h.done).length;
  }

  return NextResponse.json({
    user,
    challengePeriod: {
      start: CHALLENGE_START,
      end: CHALLENGE_END,
      totalDays: 40,
    },
    records,
    stats: {
      daysWithRecords,
      totalPrayers,
      jamaatCount,
      infradiCount,
      qazaCount,
      totalZikr,
      totalTilawat,
      totalHifazat,
    },
  });
}
