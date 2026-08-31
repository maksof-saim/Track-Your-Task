import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date query required (YYYY-MM-DD)" }, { status: 400 });
  }

  // Validate date is not in the future
  if (date > todayISO()) {
    return NextResponse.json({ error: "Cannot view future dates" }, { status: 400 });
  }

  // Validate date is not before app launch
  if (date < APP_LAUNCH_DATE) {
    return NextResponse.json({ error: `Records before ${APP_LAUNCH_DATE} are not available` }, { status: 400 });
  }

  const dateValue = new Date(`${date}T00:00:00.000Z`);

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Validate user had joined by the selected date
  const userJoinDate = user.createdAt.toISOString().slice(0, 10);
  if (userJoinDate > date) {
    return NextResponse.json({
      error: `User joined on ${userJoinDate}, which is after the selected date ${date}`
    }, { status: 400 });
  }

  // Get prayer logs for the date
  const prayerLogs = await prisma.prayerLog.findMany({
    where: { userId, date: dateValue, customPrayerId: null },
  });

  // Get custom prayer logs for the date
  const customPrayerLogs = await prisma.prayerLog.findMany({
    where: { userId, date: dateValue, customPrayerId: { not: null } },
    include: { customPrayer: true },
  });

  // Get zikr logs for the date
  const zikrLogs = await prisma.zikrLog.findMany({
    where: { userId, date: dateValue, customZikrId: null },
  });

  // Get custom zikr logs for the date
  const customZikrLogs = await prisma.zikrLog.findMany({
    where: { userId, date: dateValue, customZikrId: { not: null } },
    include: { customZikr: true },
  });

  // Get checklist logs for the date
  const checklistLogs = await prisma.checklistLog.findMany({
    where: { userId, date: dateValue, customTilawatId: null, customHifazatId: null },
  });

  // Get custom tilawat logs for the date
  const customTilawatLogs = await prisma.checklistLog.findMany({
    where: { userId, date: dateValue, customTilawatId: { not: null } },
    include: { customTilawat: true },
  });

  // Get custom hifazat logs for the date
  const customHifazatLogs = await prisma.checklistLog.findMany({
    where: { userId, date: dateValue, customHifazatId: { not: null } },
    include: { customHifazat: true },
  });

  // Calculate total recorded days for this user
  const totalRecordedDays = await prisma.prayerLog.groupBy({
    by: ['date'],
    where: { userId },
  });

  return NextResponse.json({
    user,
    totalRecordedDays: totalRecordedDays.length,
    selectedDate: date,
    prayers: prayerLogs.map(l => ({ prayer: l.prayer, status: l.status })),
    customPrayers: customPrayerLogs.map(l => ({
      id: l.customPrayerId,
      name: l.customPrayer?.name || 'Unknown',
      status: l.status
    })),
    zikr: zikrLogs.map(l => ({ name: l.name, count: l.count, mode: l.mode })),
    customZikr: customZikrLogs.map(l => ({
      id: l.customZikrId,
      name: l.customZikr?.name || 'Unknown',
      count: l.count,
      mode: l.mode
    })),
    tilawat: checklistLogs.filter(l => l.section === 'TILAWAT').map(l => ({ item: l.item, done: l.done })),
    customTilawat: customTilawatLogs.map(l => ({
      id: l.customTilawatId,
      name: l.customTilawat?.name || 'Unknown',
      done: l.done
    })),
    hifazat: checklistLogs.filter(l => l.section === 'HIFAZAT').map(l => ({ item: l.item, done: l.done })),
    customHifazat: customHifazatLogs.map(l => ({
      id: l.customHifazatId,
      name: l.customHifazat?.name || 'Unknown',
      done: l.done,
      hint: l.customHifazat?.hint
    })),
  });
}
