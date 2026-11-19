import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MAX_CUSTOM_ITEMS = 30;

const customHifazatSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  hint: z.string().trim().max(200, "Hint must be less than 200 characters").optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customHifazats = await prisma.customHifazat.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ customHifazats });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = customHifazatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }

  const { name, hint } = parsed.data;
  const lowerName = name.toLowerCase();

  const existing = await prisma.customHifazat.findMany({
    where: { userId: session.user.id },
    select: { name: true },
  });

  if (existing.length >= MAX_CUSTOM_ITEMS) {
    return NextResponse.json(
      { error: `You can add up to ${MAX_CUSTOM_ITEMS} custom hifazat items` },
      { status: 400 },
    );
  }

  if (existing.some((item) => item.name.trim().toLowerCase() === lowerName)) {
    return NextResponse.json(
      { error: "You already have a hifazat item with this name" },
      { status: 409 },
    );
  }

  const customHifazat = await prisma.customHifazat.create({
    data: { userId: session.user.id, name, hint: hint || null },
  });

  return NextResponse.json(customHifazat, { status: 201 });
}