import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BUILTIN_PRAYER_NAMES = ["salat ul tawbah", "salat al tawbah", "salatuttawbah"];
const MAX_CUSTOM_ITEMS = 30;

const customPrayerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customPrayers = await prisma.customPrayer.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    customPrayers: customPrayers.filter(
      (p) => !BUILTIN_PRAYER_NAMES.includes(p.name.trim().toLowerCase()),
    ),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = customPrayerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }

  const { name } = parsed.data;
  const lowerName = name.toLowerCase();

  if (BUILTIN_PRAYER_NAMES.includes(lowerName)) {
    return NextResponse.json(
      { error: "Salat ul Tawbah is already available as a built-in prayer" },
      { status: 400 },
    );
  }

  const existing = await prisma.customPrayer.findMany({
    where: { userId: session.user.id },
    select: { name: true },
  });

  if (existing.length >= MAX_CUSTOM_ITEMS) {
    return NextResponse.json(
      { error: `You can add up to ${MAX_CUSTOM_ITEMS} custom prayers` },
      { status: 400 },
    );
  }

  if (existing.some((item) => item.name.trim().toLowerCase() === lowerName)) {
    return NextResponse.json(
      { error: "You already have a prayer with this name" },
      { status: 409 },
    );
  }

  const customPrayer = await prisma.customPrayer.create({
    data: { userId: session.user.id, name },
  });

  return NextResponse.json(customPrayer, { status: 201 });
}