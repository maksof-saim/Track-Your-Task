"use client";

import { signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n/client";

export default function LogoutButton() {
  const { t } = useI18n();

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-medium text-white/90 transition-colors hover:bg-white/10 sm:px-4 sm:text-sm"
    >
      {t.header.logout}
    </button>
  );
}
