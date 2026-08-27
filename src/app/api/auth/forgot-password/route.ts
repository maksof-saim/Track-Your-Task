import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { createResetToken, RESET_TOKEN_TTL_MS } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Sahi email likhein" }, { status: 400 });

  console.log("Forgot password request for email:", parsed.data.email);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  console.log("User found:", user ? "YES" : "NO");

  let developmentResetUrl: string | undefined;
  if (user) {
    const { token, tokenHash } = createResetToken();
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });
    const baseUrl = process.env.APP_URL ?? new URL(request.url).origin;
    developmentResetUrl = `${baseUrl}/reset-password?token=${token}`;
    console.log("Reset URL:", developmentResetUrl);
    console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "SET" : "MISSING");
    console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "MISSING");

    try {
      const emailResult = await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl: developmentResetUrl });
      console.log("Email send result:", emailResult);
    } catch (error) {
      console.error("Password reset email failed", error);
    }
  }

  return NextResponse.json({
    message: "Agar is email ka account hai to reset link bhej diya gaya hai.",
    ...(process.env.NODE_ENV !== "production" && developmentResetUrl ? { developmentResetUrl } : {}),
  });
}
