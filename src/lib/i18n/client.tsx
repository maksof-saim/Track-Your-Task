"use client";

import { createContext, useContext, type ReactNode } from "react";
import { LOCALE_COOKIE, localeDir, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

type I18nValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, dir: localeDir(locale), t: getDictionary(locale) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside LocaleProvider");
  return value;
}

/** Stores the chosen language; the caller refreshes so server components pick it up. */
export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Saves the choice on the account as well, so the same user gets it on other
 * devices. The cookie switches the UI immediately; the network call is best
 * effort and never blocks the refresh.
 */
export async function saveLocale(locale: Locale) {
  setLocaleCookie(locale);
  try {
    await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
  } catch {
    // The cookie already switched this device, so a failed save is not fatal.
  }
}
