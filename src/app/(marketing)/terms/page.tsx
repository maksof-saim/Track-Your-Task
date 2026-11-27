import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import LegalBody from "@/components/LegalBody";
import { LEGAL_UPDATED, SITE_NAME, SITE_URL } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: `Terms of Use – ${SITE_NAME}` },
  description: "The terms that apply when you use Track Your Amaal.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const copy = getDictionary(await getLocale()).terms;

  return (
    <LegalPage title={copy.title} updated={LEGAL_UPDATED}>
      <LegalBody copy={copy} />
    </LegalPage>
  );
}
