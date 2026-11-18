import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { isAdminEmail } from "@/lib/admin";
import { allowRequest, getClientIp, hashKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!(await allowRequest("registerIp", hashKey(getClientIp(request.headers))))) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a while." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role: isAdminEmail(email) ? "ADMIN" : "USER" },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}