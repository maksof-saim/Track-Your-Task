import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import LegalBody from "@/components/LegalBody";
import { LEGAL_UPDATED, SITE_NAME, SITE_URL } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: `Privacy Policy – ${SITE_NAME}` },
  description:
    "How Track Your Amaal collects, uses and protects your information, and the choices you have.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const copy = getDictionary(await getLocale()).privacy;

  return (
    <LegalPage title={copy.title} updated={LEGAL_UPDATED}>
      <LegalBody copy={copy} />
    </LegalPage>
  );
}
