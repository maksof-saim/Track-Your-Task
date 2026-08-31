import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { zikrLogSchema } from "@/lib/validation";
import { todayISO } from "@/lib/prayerMeta";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date query required (YYYY-MM-DD)" }, { status: 400 });
  }

  const logs = await prisma.zikrLog.findMany({
    where: { userId: session.user.id, date: new Date(`${date}T00:00:00.000Z`) },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    entries: logs.map((l) => ({ name: l.name, count: l.count, mode: l.mode })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  // Handle custom zikr entries
  if (body.customZikrId) {
    const { date, customZikrId, mode, count } = body;

    // Validate date is not in the future
    if (date > todayISO()) {
      return NextResponse.json(
        { error: "Cannot save records for future dates" },
        { status: 400 },
      );
    }

    const dateValue = new Date(`${date}T00:00:00.000Z`);

    const log = await prisma.zikrLog.upsert({
      where: {
        userId_date_customZikrId: {
          userId: session.user.id,
          date: dateValue,
          customZikrId,
        },
      },
      update: { count: mode === "COUNT" ? count : 0, mode },
      create: {
        userId: session.user.id,
        date: dateValue,
        customZikrId,
        name: "Custom Zikr",
        count: mode === "COUNT" ? count : 0,
        mode,
      },
    });

    return NextResponse.json({ name: log.name, count: log.count, mode: log.mode });
  }

  // Handle standard zikr entries
  const parsed = zikrLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }

  const { date, name, mode, count } = parsed.data;

  // Validate date is not in the future
  if (date > todayISO()) {
    return NextResponse.json(
      { error: "Cannot save records for future dates" },
      { status: 400 },
    );
  }

  const dateValue = new Date(`${date}T00:00:00.000Z`);

  const log = await prisma.zikrLog.upsert({
    where: {
      userId_date_name: { userId: session.user.id, date: dateValue, name },
    },
    update: { count: mode === "COUNT" ? count : 0, mode },
    create: {
      userId: session.user.id,
      date: dateValue,
      name,
      count: mode === "COUNT" ? count : 0,
      mode,
    },
  });

  return NextResponse.json({ name: log.name, count: log.count, mode: log.mode });
}
