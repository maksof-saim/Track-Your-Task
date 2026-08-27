import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/password-reset";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ghalat data" }, { status: 400 });

  const tokenHash = hashResetToken(parsed.data.token);
  console.log("Reset password attempt - Token:", parsed.data.token.substring(0, 8) + "...");
  console.log("Token hash:", tokenHash);

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  console.log("Found reset token:", resetToken ? "YES" : "NO");

  if (resetToken) {
    console.log("Token expires at:", resetToken.expiresAt);
    console.log("Current time:", new Date());
    console.log("Is expired:", resetToken.expiresAt <= new Date());
  }

  if (!resetToken || resetToken.expiresAt <= new Date()) {
    if (resetToken) await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return NextResponse.json({ error: "Reset link invalid ya expire ho chuka hai" }, { status: 400 });
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
