import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prayerLogSchema } from "@/lib/validation";

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

  const logs = await prisma.prayerLog.findMany({
    where: { userId: session.user.id, date: new Date(`${date}T00:00:00.000Z`) },
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
  const parsed = prayerLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ghalat data" },
      { status: 400 },
    );
  }

  const { date, entries } = parsed.data;
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
