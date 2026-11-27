import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { localeDir } from "@/lib/i18n/config";

export default async function NotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale).public.notFound;

  return (
    <div
      lang={locale}
      dir={localeDir(locale)}
      data-locale={locale}
      className="flex min-h-screen flex-col items-center justify-center bg-[#f6f3ea] px-6 text-center text-[#23302c]"
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-[#7a5f17]">{t.code}</p>
      <h1 className="mt-3 text-3xl font-bold text-[#084538] sm:text-4xl">{t.title}</h1>
      <p className="mt-3 max-w-md text-base leading-7 text-[#4a5a55]">{t.body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#0b5d4b] px-8 text-base font-semibold text-white hover:bg-[#084538]"
        >
          {t.home}
        </Link>
        <Link
          href="/tools"
          className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#0b5d4b] px-8 text-base font-semibold text-[#0b5d4b] hover:bg-white"
        >
          {t.tools}
        </Link>
      </div>
    </div>
  );
}
