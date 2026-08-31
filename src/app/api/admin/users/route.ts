import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserAnalytics } from "@/lib/analytics";
import { todayISO } from "@/lib/prayerMeta";

// Application launch date - records before this date should not be shown
const APP_LAUNCH_DATE = "2026-08-29";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("search") || "";
  const dateFilter = searchParams.get("date") || "";

  // Validate date format
  if (dateFilter && !/^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
  }

  // Validate date is not in the future
  if (dateFilter && dateFilter > todayISO()) {
    return NextResponse.json({ error: "Cannot view future dates" }, { status: 400 });
  }

  // Validate date is not before app launch
  if (dateFilter && dateFilter < APP_LAUNCH_DATE) {
    return NextResponse.json({ error: `Records before ${APP_LAUNCH_DATE} are not available` }, { status: 400 });
  }

  let users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // Apply search filter server-side
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    users = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }

  // If date filter is provided, filter users who have records on that date
  // AND who had joined by that date
  let filteredUsers = users;
  let targetDate: string | undefined = undefined;

  if (dateFilter) {
    targetDate = dateFilter;
    const dateValue = new Date(`${dateFilter}T00:00:00.000Z`);

    // Get user IDs who have any record on the filtered date
    const prayerLogs = await prisma.prayerLog.findMany({
      where: { date: dateValue },
      select: { userId: true },
      distinct: ["userId"],
    });

    const zikrLogs = await prisma.zikrLog.findMany({
      where: { date: dateValue },
      select: { userId: true },
      distinct: ["userId"],
    });

    const checklistLogs = await prisma.checklistLog.findMany({
      where: { date: dateValue },
      select: { userId: true },
      distinct: ["userId"],
    });

    const userIdsWithRecords = new Set([
      ...prayerLogs.map(l => l.userId),
      ...zikrLogs.map(l => l.userId),
      ...checklistLogs.map(l => l.userId),
    ]);

    // Filter users who:
    // 1. Have records on the selected date
    // 2. Had joined by the selected date (joinDate <= selectedDate)
    filteredUsers = users.filter(user => {
      const userJoinDate = user.createdAt.toISOString().slice(0, 10);
      return userIdsWithRecords.has(user.id) && userJoinDate <= dateFilter;
    });
  }

  const rows = await Promise.all(
    filteredUsers.map(async (user) => ({
      ...user,
      analytics: await getUserAnalytics(user.id, targetDate),
    })),
  );

  return NextResponse.json({ users: rows });
}
