import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";

// A signed-in session is re-checked against the database at most this often.
const SESSION_CHECK_MS = 60 * 1000;

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
        try {
          if (user.id) {
            const record = await prisma.user.findUnique({
              where: { id: user.id },
              select: { sessionVersion: true, role: true },
            });
            if (record) {
              token.sv = record.sessionVersion;
              token.role = record.role;
            }
          }
        } catch (error) {
          console.error("Could not read the session version at sign-in", error);
        }
        token.checkedAt = Date.now();
        return token;
      }

      const now = Date.now();
      const lastChecked = typeof token.checkedAt === "number" ? token.checkedAt : 0;
      if (now - lastChecked < SESSION_CHECK_MS) return token;

      try {
        const record = token.id
          ? await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { sessionVersion: true, role: true },
            })
          : null;

        // The account was deleted or its password was reset: end this session.
        if (!record) return null;

        // Sessions created before this feature have no version yet, so they count as version 0.
        const tokenVersion = typeof token.sv === "number" ? token.sv : 0;
        if (record.sessionVersion !== tokenVersion) return null;

        token.sv = tokenVersion;
        token.role = record.role;
        token.checkedAt = now;
      } catch (error) {
        // Do not sign everyone out because of a temporary database problem.
        console.error("Session check failed", error);
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
