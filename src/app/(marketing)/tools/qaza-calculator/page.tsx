import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import QazaCalculator from "@/components/QazaCalculator";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: `Qaza Prayer Calculator – Missed Prayers – ${SITE_NAME}` },
  description:
    "Estimate how many missed prayers you need to make up and how long it may take. A simple Qaza namaz calculator that works in your browser. No sign-up needed.",
  alternates: { canonical: "/tools/qaza-calculator" },
};

export default async function QazaCalculatorPage() {
  const t = getDictionary(await getLocale()).public.qaza;

  return (
    <SiteShell>
      <h1 className="text-3xl leading-tight font-bold text-[#084538] sm:text-4xl">{t.title}</h1>
      <p className="mt-3 mb-6 text-base leading-7 text-[#3a4a45]">{t.subtitle}</p>

      <QazaCalculator />

      <section className="mt-10">
        <h2 className="mb-3 text-xl font-bold text-[#084538]">{t.howHeading}</h2>
        <ul className="list-disc space-y-2 ps-6 text-base leading-7 text-[#3a4a45]">
          {t.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <p className="mt-4 text-base leading-7 text-[#3a4a45]">{t.note}</p>
      </section>
    </SiteShell>
  );
}
