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
  const dateFilter = searchParams.get("date") || "";

  // Validate date format
  if (dateFilter && !/^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
  }

  // Validate date is a class day (Saturday or Sunday)
  if (dateFilter && !isClassDay(dateFilter)) {
    return NextResponse.json({ error: "Attendance can only be marked on Saturday or Sunday" }, { status: 400 });
  }

  // Validate date is not before app launch
  if (dateFilter && dateFilter < APP_LAUNCH_DATE) {
    return NextResponse.json({ error: `Records before ${APP_LAUNCH_DATE} are not available` }, { status: 400 });
  }

  // Default to today if no date filter provided
  const filterDate = dateFilter || todayISO();
  const dateValue = new Date(`${filterDate}T00:00:00.000Z`);

  // Get all users
  const users = await withRetry(() =>
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
  );

  // Get attendance logs for the filtered date
  const attendanceLogs = await withRetry(() =>
    prisma.attendanceLog.findMany({
      where: { date: dateValue },
      select: { userId: true, status: true, applicationStatus: true, applicationNote: true },
    })
  );

  // Create a map of userId -> attendance data
  const attendanceMap = new Map(
    attendanceLogs.map(log => [
      log.userId,
      {
        status: log.status,
        applicationStatus: log.applicationStatus,
        applicationNote: log.applicationNote,
      }
    ])
  );

  // Filter users who had joined by the selected date
  const filteredUsers = users.filter(user => {
    const userJoinDate = user.createdAt.toISOString().slice(0, 10);
    return userJoinDate <= filterDate;
  });

  // Combine user data with attendance status
  const rows = filteredUsers.map(user => {
    const attendanceData = attendanceMap.get(user.id);
    return {
      ...user,
      attendance: attendanceData?.status || null,
      applicationStatus: attendanceData?.applicationStatus || null,
      applicationNote: attendanceData?.applicationNote || null,
    };
  });

  return NextResponse.json({ users: rows, date: filterDate });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const { date, attendance } = body;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  if (!attendance || !Array.isArray(attendance)) {
    return NextResponse.json({ error: "Invalid attendance data" }, { status: 400 });
  }

  const dateValue = new Date(`${date}T00:00:00.000Z`);

  try {
    await prisma.$transaction(
      attendance.map((item: { userId: string; status: string; applicationStatus?: string; applicationNote?: string }) =>
        prisma.attendanceLog.upsert({
          where: {
            userId_date: {
              userId: item.userId,
              date: dateValue,
            },
          },
          update: {
            status: item.status as "PRESENT" | "ABSENT",
            applicationStatus: item.applicationStatus as "SUBMITTED" | "NOT_SUBMITTED" | null,
            applicationNote: item.applicationNote || null,
          },
          create: {
            userId: item.userId,
            date: dateValue,
            status: item.status as "PRESENT" | "ABSENT",
            applicationStatus: item.applicationStatus as "SUBMITTED" | "NOT_SUBMITTED" | null,
            applicationNote: item.applicationNote || null,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save attendance" },
      { status: 500 }
    );
  }
}
