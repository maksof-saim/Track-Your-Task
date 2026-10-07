import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayISO } from "@/lib/prayerMeta";
import { isClassDay } from "@/lib/dateUtils";

// Application launch date - records before this date should not be shown
const APP_LAUNCH_DATE = "2026-08-29";

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
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  // Check if user exists
  const user = await withRetry(() =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, createdAt: true },
    })
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userJoinDate = user.createdAt.toISOString().slice(0, 10);
  const startDate = userJoinDate > APP_LAUNCH_DATE ? userJoinDate : APP_LAUNCH_DATE;
  const today = todayISO();

  // Get all attendance logs for the user from their join date to today
  const attendanceLogs = await withRetry(() =>
    prisma.attendanceLog.findMany({
      where: {
        userId,
        date: {
          gte: new Date(`${startDate}T00:00:00.000Z`),
          lte: new Date(`${today}T23:59:59.999Z`),
        },
      },
      select: { status: true },
    })
  );

  // Calculate statistics
  const presentCount = attendanceLogs.filter(log => log.status === "PRESENT").length;
  const absentCount = attendanceLogs.filter(log => log.status === "ABSENT").length;
  const totalMarked = presentCount + absentCount;

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
    },
    stats: {
      present: presentCount,
      absent: absentCount,
      totalMarked,
      attendanceRate: totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0,
    },
  });
}
