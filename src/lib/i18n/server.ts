import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";

/**
 * The visitor's language: an explicit choice in the cookie wins, otherwise the
 * locale saved on the account, otherwise the default. The database is read only
 * when there is no cookie, so the common path costs nothing.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(value)) return value;

  const session = await auth();
  const userId = session?.user?.id;
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { locale: true },
      });
      if (isLocale(user?.locale)) return user.locale;
    } catch (error) {
      console.error("Could not read the saved locale", error);
    }
  }

  return DEFAULT_LOCALE;
}
