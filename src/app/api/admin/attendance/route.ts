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
      select: { userId: true, status: true },
    })
  );

  // Create a map of userId -> attendance status
  const attendanceMap = new Map(
    attendanceLogs.map(log => [log.userId, log.status])
  );

  // Filter users who had joined by the selected date
  const filteredUsers = users.filter(user => {
    const userJoinDate = user.createdAt.toISOString().slice(0, 10);
    return userJoinDate <= filterDate;
  });

  // Combine user data with attendance status
  const rows = filteredUsers.map(user => ({
    ...user,
    attendance: attendanceMap.get(user.id) || null, // null means not marked yet
  }));

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

  const body = await request.json();
  const { date, attendance } = body;

  // Validate date format
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
  }

  // Validate date is a class day (Saturday or Sunday)
  if (!isClassDay(date)) {
    return NextResponse.json({ error: "Attendance can only be marked on Saturday or Sunday" }, { status: 400 });
  }

  // Validate date is not before app launch
  if (date < APP_LAUNCH_DATE) {
    return NextResponse.json({ error: `Records before ${APP_LAUNCH_DATE} are not available` }, { status: 400 });
  }

  // Validate attendance data
  if (!attendance || !Array.isArray(attendance)) {
    return NextResponse.json({ error: "Invalid attendance data" }, { status: 400 });
  }

  const dateValue = new Date(`${date}T00:00:00.000Z`);

  try {
    // Use a transaction to ensure all updates are atomic
    await prisma.$transaction(async (tx) => {
      for (const record of attendance) {
        const { userId, status } = record;

        // Validate status
        if (status !== "PRESENT" && status !== "ABSENT") {
          throw new Error(`Invalid status: ${status}`);
        }

        // Check if user exists
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { createdAt: true },
        });

        if (!user) {
          throw new Error(`User not found: ${userId}`);
        }

        // Check if user had joined by the selected date
        const userJoinDate = user.createdAt.toISOString().slice(0, 10);
        if (userJoinDate > date) {
          throw new Error(`User joined after the selected date: ${userId}`);
        }

        // Upsert attendance record
        await tx.attendanceLog.upsert({
          where: {
            userId_date: {
              userId,
              date: dateValue,
            },
          },
          create: {
            userId,
            date: dateValue,
            status,
          },
          update: {
            status,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save attendance" },
      { status: 500 }
    );
  }
}
