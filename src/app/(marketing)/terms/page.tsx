import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { CONTACT_EMAIL, LEGAL_UPDATED, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { absolute: `Terms of Use – ${SITE_NAME}` },
    description: "The terms that apply when you use Track Your Amaal.",
    alternates: { canonical: "/terms" },
};

export default function TermsPage() {
    return (
        <LegalPage title="Terms of Use" updated={LEGAL_UPDATED}>
            <p className="mt-6 text-base leading-7 text-[#3a4a45]">
                These terms apply when you use {SITE_NAME}. By creating an account or using the service you
                agree to them.
            </p>

            <LegalSection title="1. About the service">
                <p>
                    {SITE_NAME} is a tool for recording your own worship, such as prayers, dhikr, tilawat and
                    hifazat. It is provided for personal, non-commercial use.
                </p>
            </LegalSection>

            <LegalSection title="2. Your account">
                <ul className="list-disc space-y-2 ps-6">
                    <li>Provide accurate information when you register.</li>
                    <li>Keep your password private. You are responsible for activity under your account.</li>
                    <li>Tell us if you think someone has accessed your account without permission.</li>
                </ul>
            </LegalSection>

            <LegalSection title="3. Acceptable use">
                <p>You agree not to:</p>
                <ul className="list-disc space-y-2 ps-6">
                    <li>use the service for anything unlawful;</li>
                    <li>try to access other peoples accounts or data;</li>
                    <li>disrupt the service or send automated or abusive traffic to it.</li>
                </ul>
            </LegalSection>

            <LegalSection title="4. Religious content">
                <p>
                    {SITE_NAME} is a personal tracking tool and is not a source of religious rulings. Texts,
                    reminders and labels in the app are provided for convenience. Please consult qualified
                    scholars for religious guidance, and verify any text before relying on it.
                </p>
            </LegalSection>

            <LegalSection title="5. Availability">
                <p>
                    The service is provided as it is. It may change, be interrupted or be unavailable from
                    time to time. We take care to keep your records safe, but you should not rely on the
                    service as the only copy of anything important to you.
                </p>
            </LegalSection>

            <LegalSection title="6. Your data">
                <p>
                    How we handle your information is described in our{" "}
                    <a className="font-medium text-[#0b5d4b] underline" href="/privacy">
                        Privacy Policy
                    </a>
                    .
                </p>
            </LegalSection>

            <LegalSection title="7. Ending your use">
                <p>
                    You can stop using the service at any time and ask us to delete your account. We may
                    suspend or remove accounts that break these terms.
                </p>
            </LegalSection>

            <LegalSection title="8. Limits on our responsibility">
                <p>
                    To the extent allowed by law, we are not responsible for loss or damage that results from
                    using, or being unable to use, the service.
                </p>
            </LegalSection>

            <LegalSection title="9. Changes to these terms">
                <p>
                    We may update these terms from time to time. The date at the top of this page shows when
                    they were last changed. Continuing to use the service after a change means you accept the
                    updated terms.
                </p>
            </LegalSection>

            <LegalSection title="10. Contact">
                <p>
                    Questions about these terms can be sent to{" "}
                    <a className="font-medium text-[#0b5d4b] underline" href={`mailto:${CONTACT_EMAIL}`}>
                        {CONTACT_EMAIL}
                    </a>
                    .
                </p>
            </LegalSection>
        </LegalPage>
    );
}