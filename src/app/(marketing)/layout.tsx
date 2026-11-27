import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import { localeDir } from "@/lib/i18n/config";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <LocaleProvider locale={locale}>
      <div lang={locale} dir={localeDir(locale)} data-locale={locale}>
        {children}
      </div>
    </LocaleProvider>
  );
}
