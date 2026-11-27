import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import TasbeehCounter from "@/components/TasbeehCounter";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: `Online Tasbeeh Counter (Digital Tasbih) – ${SITE_NAME}` },
  description:
    "A simple digital tasbeeh counter for dhikr. Tap to count, set a target such as 33, 99 or 100, and keep your count saved on your device. No sign-up needed.",
  alternates: { canonical: "/tools/tasbeeh" },
};

export default async function TasbeehPage() {
  const t = getDictionary(await getLocale()).public.tasbeeh;

  return (
    <SiteShell>
      <h1 className="text-3xl leading-tight font-bold text-[#084538] sm:text-4xl">{t.title}</h1>
      <p className="mt-3 mb-6 text-base leading-7 text-[#3a4a45]">{t.subtitle}</p>

      <TasbeehCounter />

      <section className="mt-10">
        <h2 className="mb-3 text-xl font-bold text-[#084538]">{t.howHeading}</h2>
        <ol className="list-decimal space-y-2 ps-6 text-base leading-7 text-[#3a4a45]">
          {t.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-4 text-base leading-7 text-[#3a4a45]">{t.note}</p>
      </section>
    </SiteShell>
  );
}
