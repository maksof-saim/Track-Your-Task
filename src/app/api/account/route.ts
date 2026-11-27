import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { allowRequest, hashKey } from "@/lib/rate-limit";
import { isLocale } from "@/lib/i18n/config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true, createdAt: true, passwordHash: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    hasPassword: Boolean(user.passwordHash),
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const locale = body && typeof body === "object" ? body.locale : null;
  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  }

  // Only ever touch the signed-in user's own row; the body cannot name a user.
  await prisma.user.update({
    where: { id: session.user.id },
    data: { locale },
  });

  return NextResponse.json({ ok: true, locale });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || body.confirm !== "DELETE") {
    return NextResponse.json({ error: "Type DELETE to confirm" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, passwordHash: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json(
      { error: "Administrator accounts cannot be deleted here" },
      { status: 403 },
    );
  }

  // Accounts with a password must confirm it. Google-only accounts have none.
  if (user.passwordHash) {
    const password = typeof body.password === "string" ? body.password : "";
    if (!password) {
      return NextResponse.json({ error: "Please enter your password" }, { status: 400 });
    }
    if (!(await allowRequest("loginEmail", hashKey(`delete|${user.id}`)))) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }
    if (!(await compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
    }
  }

  // All of the user's records are removed together with the account (cascade).
  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}