import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { zikrLogSchema } from "@/lib/validation";

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
    entries: logs.map((l) => ({ name: l.name, count: l.count })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = zikrLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ghalat data" },
      { status: 400 },
    );
  }

  const { date, name, delta } = parsed.data;
  const dateValue = new Date(`${date}T00:00:00.000Z`);

  const existing = await prisma.zikrLog.findUnique({
    where: {
      userId_date_name: { userId: session.user.id, date: dateValue, name },
    },
  });

  const nextCount = Math.max(0, (existing?.count ?? 0) + delta);

  const log = await prisma.zikrLog.upsert({
    where: {
      userId_date_name: { userId: session.user.id, date: dateValue, name },
    },
    update: { count: nextCount },
    create: {
      userId: session.user.id,
      date: dateValue,
      name,
      count: nextCount,
    },
  });

  return NextResponse.json({ name: log.name, count: log.count });
}
