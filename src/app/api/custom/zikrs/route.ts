import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AZKAAR_TARGET_ITEMS } from "@/lib/checklistMeta";

const MAX_CUSTOM_ITEMS = 30;

const customZikrSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  hasCount: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customZikrs = await prisma.customZikr.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ customZikrs });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = customZikrSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }

  const { name, hasCount } = parsed.data;
  const lowerName = name.toLowerCase();

  if (AZKAAR_TARGET_ITEMS.some((item) => item.name.trim().toLowerCase() === lowerName)) {
    return NextResponse.json(
      { error: "This zikr is already available in the app" },
      { status: 400 },
    );
  }

  const existing = await prisma.customZikr.findMany({
    where: { userId: session.user.id },
    select: { name: true },
  });

  if (existing.length >= MAX_CUSTOM_ITEMS) {
    return NextResponse.json(
      { error: `You can add up to ${MAX_CUSTOM_ITEMS} custom azkaar` },
      { status: 400 },
    );
  }

  if (existing.some((item) => item.name.trim().toLowerCase() === lowerName)) {
    return NextResponse.json(
      { error: "You already have a zikr with this name" },
      { status: 409 },
    );
  }

  const customZikr = await prisma.customZikr.create({
    data: { userId: session.user.id, name, hasCount },
  });

  return NextResponse.json(customZikr, { status: 201 });
}