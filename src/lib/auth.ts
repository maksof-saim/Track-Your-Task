import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validation";
import { allowRequest, getClientIp, hashKey } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]),
  callbacks: {
    ...authConfig.callbacks,
    signIn: async ({ user, account, profile }) => {
      if (account?.provider !== "google") return true;
      if (profile?.email_verified === false) return false;

      const email = user.email?.trim().toLowerCase();
      if (!email) return false;

      // Account pre-hijacking protection: if someone registered this email with a password
      // but never proved they own it, that password is removed and the existing sessions end.
      // The Google sign-in itself proves ownership of the address.
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true, emailVerified: true, passwordHash: true },
      });
      if (existing && !existing.emailVerified && existing.passwordHash) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            passwordHash: null,
            emailVerified: new Date(),
            sessionVersion: { increment: 1 },
          },
        });
      }

      return true;
    },
  },
  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Slow down password guessing: limit attempts per IP and per email + IP.
        const ip = getClientIp(request?.headers);
        const allowed =
          (await allowRequest("loginIp", hashKey(ip))) &&
          (await allowRequest("loginEmail", hashKey(`${email}|${ip}`)));
        if (!allowed) return null;

        // Normalized email first; the fallback covers any older account saved with capital letters.
        const user =
          (await prisma.user.findUnique({ where: { email } })) ??
          (await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
          }));
        if (!user?.passwordHash) return null;

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
});