import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import TasbeehCounter from "@/components/TasbeehCounter";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { absolute: `Online Tasbeeh Counter (Digital Tasbih) – ${SITE_NAME}` },
    description:
        "A simple digital tasbeeh counter for dhikr. Tap to count, set a target such as 33, 99 or 100, and keep your count saved on your device. No sign-up needed.",
    alternates: { canonical: "/tools/tasbeeh" },
};

export default function TasbeehPage() {
    return (
        <SiteShell>
            <h1 className="text-3xl font-bold leading-tight text-[#084538] sm:text-4xl">
                Online Tasbeeh Counter
            </h1>
            <p className="mb-6 mt-3 text-base leading-7 text-[#3a4a45]">
                Tap the big button for every dhikr you recite. Pick a target, and the counter tells you when
                a round is complete. Works on phones, tablets and computers.
            </p>

            <TasbeehCounter />

            <section className="mt-10">
                <h2 className="mb-3 text-xl font-bold text-[#084538]">How to use the tasbeeh counter</h2>
                <ol className="list-decimal space-y-2 ps-6 text-base leading-7 text-[#3a4a45]">
                    <li>Choose the dhikr you are reciting, or pick Any dhikr.</li>
                    <li>Set a target such as 33, 99 or 100, or choose No target to count freely.</li>
                    <li>Tap the large button once for each recitation. On supported phones it vibrates gently.</li>
                    <li>Use Undo if you tapped by mistake, and Reset to start again.</li>
                </ol>
                <p className="mt-4 text-base leading-7 text-[#3a4a45]">
                    Your count is stored only in your browser on this device, so it is still there when you
                    come back.
                </p>
            </section>
        </SiteShell>
    );
}