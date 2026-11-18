import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BUILTIN_PRAYER_NAMES = ["salat ul tawbah", "salat al tawbah", "salatuttawbah"];

const customPrayerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
});

export async function GET(request: Request) {
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

  if (BUILTIN_PRAYER_NAMES.includes(name.trim().toLowerCase())) {
    return NextResponse.json(
      { error: "Salat ul Tawbah is already available as a built-in prayer" },
      { status: 400 },
    );
  }

  const customPrayer = await prisma.customPrayer.create({
    data: { userId: session.user.id, name },
  });

  return NextResponse.json(customPrayer, { status: 201 });
}
