import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checklistLogSchema, CHECKLIST_SECTIONS } from "@/lib/validation";
import { todayISO } from "@/lib/prayerMeta";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const section = searchParams.get("section");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date query required (YYYY-MM-DD)" }, { status: 400 });
  }
  if (!section || !CHECKLIST_SECTIONS.includes(section as (typeof CHECKLIST_SECTIONS)[number])) {
    return NextResponse.json({ error: "section query required" }, { status: 400 });
  }

  const logs = await prisma.checklistLog.findMany({
    where: {
      userId: session.user.id,
      date: new Date(`${date}T00:00:00.000Z`),
      section: section as (typeof CHECKLIST_SECTIONS)[number],
    },
  });

  return NextResponse.json({
    items: logs.map((l) => ({ item: l.item, done: l.done })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checklistLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ghalat data" },
      { status: 400 },
    );
  }

  const { date, section, items } = parsed.data;

  // Validate date is not in the future
  if (date > todayISO()) {
    return NextResponse.json(
      { error: "Cannot save records for future dates" },
      { status: 400 },
    );
  }

  const dateValue = new Date(`${date}T00:00:00.000Z`);

  await prisma.$transaction(
    items.map((entry) =>
      prisma.checklistLog.upsert({
        where: {
          userId_date_section_item: {
            userId: session.user.id,
            date: dateValue,
            section,
            item: entry.item,
          },
        },
        update: { done: entry.done },
        create: {
          userId: session.user.id,
          date: dateValue,
          section,
          item: entry.item,
          done: entry.done,
        },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
