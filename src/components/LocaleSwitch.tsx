"use client";

import { useRouter } from "next/navigation";
import { setLocaleCookie, useI18n } from "@/lib/i18n/client";
import { LOCALE_LABELS } from "@/lib/i18n/config";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8963e] focus-visible:ring-offset-2";

/**
 * Language toggle for the public pages. Nobody is signed in there, so the
 * choice is stored in the cookie only; the refresh re-renders the server copy.
 */
export default function LocaleSwitch({ className = "" }: { className?: string }) {
  const { locale } = useI18n();
  const router = useRouter();
  const next = locale === "ur" ? "en" : "ur";

  return (
    <button
      type="button"
      onClick={() => {
        setLocaleCookie(next);
        router.refresh();
      }}
      aria-label={`Switch to ${LOCALE_LABELS[next]}`}
      className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-[#e3cf9a] hover:text-white ${focusRing} ${className}`}
    >
      {LOCALE_LABELS[next]}
    </button>
  );
}
