import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import QazaCalculator from "@/components/QazaCalculator";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { absolute: `Qaza Prayer Calculator – Missed Prayers – ${SITE_NAME}` },
    description:
        "Estimate how many missed prayers you need to make up and how long it may take. A simple Qaza namaz calculator that works in your browser. No sign-up needed.",
    alternates: { canonical: "/tools/qaza-calculator" },
};

export default function QazaCalculatorPage() {
    return (
        <SiteShell>
            <h1 className="text-3xl font-bold leading-tight text-[#084538] sm:text-4xl">
                Qaza Prayer Calculator
            </h1>
            <p className="mb-6 mt-3 text-base leading-7 text-[#3a4a45]">
                Qaza means making up prayers that were missed. Enter the dates to get an estimate of how many
                prayers you need to make up, and plan how long it may take at your own pace.
            </p>

            <QazaCalculator />

            <section className="mt-10">
                <h2 className="mb-3 text-xl font-bold text-[#084538]">How the estimate works</h2>
                <ul className="list-disc space-y-2 ps-6 text-base leading-7 text-[#3a4a45]">
                    <li>
                        The calculator counts the days between the date prayer became obligatory for you and the
                        date you started praying regularly.
                    </li>
                    <li>
                        It removes any days you exclude and any whole days of Qaza you have already made up.
                    </li>
                    <li>
                        Each remaining day counts as five daily prayers, plus Witr if you include it.
                    </li>
                </ul>
                <p className="mt-4 text-base leading-7 text-[#3a4a45]">
                    Nothing you enter is sent anywhere. The calculation happens in your browser.
                </p>
            </section>
        </SiteShell>
    );
}