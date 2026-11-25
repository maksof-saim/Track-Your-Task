import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { CONTACT_EMAIL, LEGAL_UPDATED, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { absolute: `Privacy Policy – ${SITE_NAME}` },
    description:
        "How Track Your Amaal collects, uses and protects your information, and the choices you have.",
    alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
    return (
        <LegalPage title="Privacy Policy" updated={LEGAL_UPDATED}>
            <p className="mt-6 text-base leading-7 text-[#3a4a45]">
                This Privacy Policy explains what information {SITE_NAME} collects, how it is used and the
                choices you have. By creating an account you agree to the practices described here.
            </p>

            <LegalSection title="1. Information we collect">
                <ul className="list-disc space-y-2 ps-6">
                    <li>
                        <strong>Account information:</strong> your name, email address and password. Your
                        password is stored only as a secure one-way hash, so we cannot read it.
                    </li>
                    <li>
                        <strong>Worship records:</strong> the information you enter into the app, such as
                        prayer status (Jamaat, Infradi or Qaza), dhikr counts, tilawat and hifazat checklists,
                        and any custom items you create, together with the dates they relate to.
                    </li>
                    <li>
                        <strong>Technical information:</strong> a session cookie that keeps you signed in,
                        basic server logs (for example request times and error messages) that we use to keep
                        the service running, and privacy-focused page-view statistics provided by our hosting
                        platform.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection title="2. How we use your information">
                <ul className="list-disc space-y-2 ps-6">
                    <li>To provide the app, store your records and show your summaries.</li>
                    <li>To send you a password reset email when you request one.</li>
                    <li>To protect the service, prevent abuse and fix errors.</li>
                </ul>
                <p>
                    {SITE_NAME} does not show advertisements and does not sell or rent your personal
                    information.
                </p>
            </LegalSection>

            <LegalSection title="3. Who can see your records">
                <p>
                    Your records are linked to your account and are not visible to other users. The
                    administrators of {SITE_NAME} can view user accounts and worship records through an
                    administration area, in order to support users and to run the service.
                </p>
            </LegalSection>

            <LegalSection title="4. Service providers">
                <p>We use the following providers to run the service:</p>
                <ul className="list-disc space-y-2 ps-6">
                    <li>Vercel, for hosting the website and application.</li>
                    <li>Neon, for the database. Your data is stored on servers located in the United States.</li>
                    <li>
                        Google Gmail, for sending password reset emails. Your email address and the reset link
                        pass through this service.
                    </li>
                    <li>
                        Upstash, for short-lived security counters (stored as anonymous hashes) that limit
                        repeated login and sign-up attempts.
                    </li>
                </ul>
                <p>These providers process information only to provide their services to us.</p>
            </LegalSection>

            <LegalSection title="5. Cookies">
                <p>
                    We use one essential cookie to keep you signed in. We do not use advertising cookies or
                    cross-site tracking.
                </p>
            </LegalSection>

            <LegalSection title="6. Retention and deletion">
                <p>
                    We keep your account and records for as long as your account exists. You can delete your
                    account and all associated records at any time from the Account page after you sign in.
                    You can also ask us to do it by emailing{" "}
                    <a className="font-medium text-[#0b5d4b] underline" href={`mailto:${CONTACT_EMAIL}`}>
                        {CONTACT_EMAIL}
                    </a>
                    , and we will do so within a reasonable time.
                </p>
            </LegalSection>

            <LegalSection title="7. Security">
                <p>
                    Passwords are stored as hashes and connections to the service are encrypted with HTTPS.
                    No online service is completely secure, so please choose a strong password and keep it
                    private.
                </p>
            </LegalSection>

            <LegalSection title="8. Your choices">
                <p>
                    You can download a copy of your records from the Account page. You can also ask us to
                    correct or delete your information by emailing{" "}
                    <a className="font-medium text-[#0b5d4b] underline" href={`mailto:${CONTACT_EMAIL}`}>
                        {CONTACT_EMAIL}
                    </a>
                    .
                </p>
            </LegalSection>

            <LegalSection title="9. Children">
                <p>
                    {SITE_NAME} is not directed to children under 13. If you believe a child has given us
                    personal information, please contact us and we will remove it.
                </p>
            </LegalSection>

            <LegalSection title="10. Changes to this policy">
                <p>
                    We may update this policy from time to time. The date at the top of this page shows when
                    it was last changed.
                </p>
            </LegalSection>

            <LegalSection title="11. Contact">
                <p>
                    Questions about this policy can be sent to{" "}
                    <a className="font-medium text-[#0b5d4b] underline" href={`mailto:${CONTACT_EMAIL}`}>
                        {CONTACT_EMAIL}
                    </a>
                    .
                </p>
            </LegalSection>
        </LegalPage>
    );
}