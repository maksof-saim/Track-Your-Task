import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import { localeDir } from "@/lib/i18n/config";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <LocaleProvider locale={locale}>
      <div
        lang={locale}
        dir={localeDir(locale)}
        data-locale={locale}
        className="flex min-h-screen flex-1 flex-col items-center justify-center bg-primary-700 px-4 py-10"
      >
        <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl sm:p-8">
          {children}
        </div>
      </div>
    </LocaleProvider>
  );
}
