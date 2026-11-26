import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checklistLogSchema,
  customChecklistLogSchema,
  checklistDeleteSchema,
  CHECKLIST_SECTIONS,
} from "@/lib/validation";
import { isFutureInEveryTimezone } from "@/lib/dateUtils";

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

  // Handle custom tilawat / hifazat items
  if (body && typeof body === "object" && "customItems" in body) {
    const parsedCustom = customChecklistLogSchema.safeParse(body);
    if (!parsedCustom.success) {
      return NextResponse.json(
        { error: parsedCustom.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 },
      );
    }

    const { date, section, customItems } = parsedCustom.data;

    if (isFutureInEveryTimezone(date)) {
      return NextResponse.json(
        { error: "Cannot save records for future dates" },
        { status: 400 },
      );
    }

    // Every custom item must belong to the signed-in user.
    const ids = [...new Set(customItems.map((entry) => entry.customId))];
    const ownedCount =
      section === "TILAWAT"
        ? await prisma.customTilawat.count({ where: { id: { in: ids }, userId: session.user.id } })
        : await prisma.customHifazat.count({ where: { id: { in: ids }, userId: session.user.id } });
    if (ownedCount !== ids.length) {
      return NextResponse.json({ error: "Unknown custom item" }, { status: 400 });
    }

    const dateValue = new Date(`${date}T00:00:00.000Z`);

    await prisma.$transaction(
      customItems.map((entry) =>
        section === "TILAWAT"
          ? prisma.checklistLog.upsert({
            where: {
              userId_date_section_customTilawatId: {
                userId: session.user.id,
                date: dateValue,
                section,
                customTilawatId: entry.customId,
              },
            },
            update: { done: entry.done },
            create: {
              userId: session.user.id,
              date: dateValue,
              section,
              item: `custom:${entry.customId}`,
              customTilawatId: entry.customId,
              done: entry.done,
            },
          })
          : prisma.checklistLog.upsert({
            where: {
              userId_date_section_customHifazatId: {
                userId: session.user.id,
                date: dateValue,
                section,
                customHifazatId: entry.customId,
              },
            },
            update: { done: entry.done },
            create: {
              userId: session.user.id,
              date: dateValue,
              section,
              item: `custom:${entry.customId}`,
              customHifazatId: entry.customId,
              done: entry.done,
            },
          }),
      ),
    );

    return NextResponse.json({ ok: true });
  }

  const parsed = checklistLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ghalat data" },
      { status: 400 },
    );
  }

  const { date, section, items } = parsed.data;

  // Validate date is not in the future
  if (isFutureInEveryTimezone(date)) {
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

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = checklistDeleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }

  const { date, section, item, customId, clearAll } = parsed.data;
  const dateValue = new Date(`${date}T00:00:00.000Z`);

  if (clearAll) {
    const result = await prisma.checklistLog.deleteMany({
      where: { userId: session.user.id, date: dateValue, section },
    });
    return NextResponse.json({ ok: true, deleted: result.count });
  }

  const where = item
    ? {
        userId: session.user.id,
        date: dateValue,
        section,
        item,
        customTilawatId: null,
        customHifazatId: null,
      }
    : customId
      ? section === "TILAWAT"
        ? { userId: session.user.id, date: dateValue, section, customTilawatId: customId }
        : { userId: session.user.id, date: dateValue, section, customHifazatId: customId }
      : null;
  if (!where) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const result = await prisma.checklistLog.deleteMany({ where });
  return NextResponse.json({ ok: true, deleted: result.count });
}
