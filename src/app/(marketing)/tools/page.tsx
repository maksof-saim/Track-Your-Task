import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: `Tasbeeh Counter and Qaza Calculator – ${SITE_NAME}` },
  description:
    "Simple online tools for your daily worship: a digital tasbeeh counter and a Qaza prayer calculator. No sign-up needed.",
  alternates: { canonical: "/tools" },
};

export default async function ToolsPage() {
  const t = getDictionary(await getLocale()).public.tools;

  const tools = [
    { href: "/tools/tasbeeh", title: t.tasbeehTitle, text: t.tasbeehText },
    { href: "/tools/qaza-calculator", title: t.qazaTitle, text: t.qazaText },
  ];

  return (
    <SiteShell wide>
      <h1 className="text-3xl leading-tight font-bold text-[#084538] sm:text-4xl">{t.title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-[#3a4a45]">{t.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-xl border border-[#e3dcc8] border-t-4 border-t-[#b8963e] bg-white p-5 transition-colors hover:border-[#b8963e] sm:p-6"
          >
            <h2 className="mb-2 text-lg font-bold text-[#0b5d4b]">{tool.title}</h2>
            <p className="text-base leading-7 text-[#4a5a55]">{tool.text}</p>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
