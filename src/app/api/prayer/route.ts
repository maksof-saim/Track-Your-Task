import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prayerLogSchema } from "@/lib/validation";
import { todayISO } from "@/lib/prayerMeta";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const custom = searchParams.get("custom") === "true";

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date query required (YYYY-MM-DD)" }, { status: 400 });
  }

  if (custom) {
    // Return custom prayer logs
    const logs = await prisma.prayerLog.findMany({
      where: {
        userId: session.user.id,
        date: new Date(`${date}T00:00:00.000Z`),
        customPrayerId: { not: null },
      },
    });

    return NextResponse.json({
      customEntries: logs.map((l) => ({ customPrayerId: l.customPrayerId, status: l.status })),
    });
  }

  // Return standard prayer logs
  const logs = await prisma.prayerLog.findMany({
    where: {
      userId: session.user.id,
      date: new Date(`${date}T00:00:00.000Z`),
      customPrayerId: null,
    },
  });

  return NextResponse.json({
    entries: logs.map((l) => ({ prayer: l.prayer, status: l.status })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  // Handle custom prayer entries
  if (body.customEntries) {
    const { date, customEntries } = body;

    // Validate date is not in the future
    if (date > todayISO()) {
      return NextResponse.json(
        { error: "Cannot save records for future dates" },
        { status: 400 },
      );
    }

    const dateValue = new Date(`${date}T00:00:00.000Z`);

    await prisma.$transaction(
      customEntries.map((entry: any) =>
        prisma.prayerLog.upsert({
          where: {
            userId_date_customPrayerId: {
              userId: session.user.id,
              date: dateValue,
              customPrayerId: entry.customPrayerId,
            },
          },
          update: { status: entry.status },
          create: {
            userId: session.user.id,
            date: dateValue,
            customPrayerId: entry.customPrayerId,
            status: entry.status,
          },
        }),
      ),
    );

    return NextResponse.json({ ok: true });
  }

  // Handle standard prayer entries
  const parsed = prayerLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }

  const { date, entries } = parsed.data;

  // Validate date is not in the future
  if (date > todayISO()) {
    return NextResponse.json(
      { error: "Cannot save records for future dates" },
      { status: 400 },
    );
  }

  const dateValue = new Date(`${date}T00:00:00.000Z`);

  await prisma.$transaction(
    entries.map((entry) =>
      prisma.prayerLog.upsert({
        where: {
          userId_date_prayer: {
            userId: session.user.id,
            date: dateValue,
            prayer: entry.prayer,
          },
        },
        update: { status: entry.status },
        create: {
          userId: session.user.id,
          date: dateValue,
          prayer: entry.prayer,
          status: entry.status,
        },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
