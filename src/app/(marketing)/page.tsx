import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const SITE_URL = process.env.APP_URL ?? "https://track-your-amaal.vercel.app";
const TITLE = "Track Your Amaal – Salah, Dhikr & Quran Habit Tracker";
const DESCRIPTION =
    "Track your daily salah (jamaat, individual or qaza), dhikr, Quran reading and self-accountability in one simple tracker. Start in a minute.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: "/",
        siteName: "Track Your Amaal",
        type: "website",
    },
    twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

const features = [
    {
        title: "Salah tracking",
        text: "Mark each of the five daily prayers as Jamaat, Infradi (individual) or Qaza, and see your whole day at a glance.",
    },
    {
        title: "Dhikr counter",
        text: "Count your daily adhkar, with a Kasrat mode for high-volume dhikr.",
    },
    {
        title: "Quran and tilawat",
        text: "A daily checklist for recitation, Surah Yaseen, Waqiah, Mulk and the Friday Surah Kahf, with key Surahs to read inside the app.",
    },
    {
        title: "Hifazat",
        text: "A daily self-review for guarding your eyes, ears and tongue, with a short reminder for each.",
    },
];

const steps = [
    { title: "Create your account", text: "Sign up with your email in under a minute." },
    { title: "Mark your day", text: "Record your prayers, dhikr, tilawat and hifazat as you go." },
    { title: "Review and improve", text: "See where you are consistent and where you can do better." },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#f6f3ea] text-[#23302c]">
            <header className="bg-[#0b5d4b]">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/icon-192.png" alt="" width={36} height={36} className="rounded-lg" />
                        <span className="text-lg font-bold text-white">Track Your Amaal</span>
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-[#e3cf9a] hover:text-white">
                            Sign in
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-md bg-[#b8963e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a38535]"
                        >
                            Get started
                        </Link>
                    </nav>
                </div>
                <div className="h-1 bg-[#b8963e]" />
            </header>

            <main>
                <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#b8963e]">
                        Prayers and zikr tracker
                    </p>
                    <h1 className="text-4xl font-bold leading-tight text-[#084538] sm:text-5xl">
                        Build the habit of worship, one day at a time
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#4a5a55]">
                        Track your daily salah, dhikr, Quran reading and self-accountability in one place, and
                        watch your consistency grow.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/register"
                            className="w-full rounded-lg bg-[#0b5d4b] px-8 py-3 text-base font-semibold text-white hover:bg-[#084538] sm:w-auto"
                        >
                            Create your account
                        </Link>
                        <Link
                            href="/login"
                            className="w-full rounded-lg border border-[#0b5d4b] px-8 py-3 text-base font-semibold text-[#0b5d4b] hover:bg-white sm:w-auto"
                        >
                            Sign in
                        </Link>
                    </div>
                </section>

                <section className="mx-auto max-w-5xl px-4 pb-16">
                    <h2 className="mb-8 text-center text-2xl font-bold text-[#084538]">
                        Everything you need for your daily amaal
                    </h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {features.map((feature) => (
                            <article
                                key={feature.title}
                                className="rounded-xl border border-[#e3dcc8] border-t-4 border-t-[#b8963e] bg-white p-6"
                            >
                                <h3 className="mb-2 text-lg font-bold text-[#0b5d4b]">{feature.title}</h3>
                                <p className="leading-7 text-[#4a5a55]">{feature.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="bg-white py-16">
                    <div className="mx-auto max-w-5xl px-4">
                        <h2 className="mb-8 text-center text-2xl font-bold text-[#084538]">How it works</h2>
                        <ol className="grid gap-6 sm:grid-cols-3">
                            {steps.map((step, index) => (
                                <li key={step.title} className="text-center">
                                    <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#0b5d4b] font-bold text-white">
                                        {index + 1}
                                    </span>
                                    <h3 className="mb-1 font-bold text-[#0b5d4b]">{step.title}</h3>
                                    <p className="text-[#4a5a55]">{step.text}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="mx-auto max-w-3xl px-4 py-16 text-center">
                    <h2 className="text-2xl font-bold text-[#084538]">Start tracking your amaal today</h2>
                    <p className="mt-3 text-[#4a5a55]">
                        Small, consistent deeds are beloved to Allah. Make them easy to see and easy to keep.
                    </p>
                    <Link
                        href="/register"
                        className="mt-6 inline-block rounded-lg bg-[#0b5d4b] px-8 py-3 text-base font-semibold text-white hover:bg-[#084538]"
                    >
                        Get started
                    </Link>
                </section>
            </main>

            <footer className="bg-[#084538] py-6 text-center text-sm text-[#e3cf9a]">
                <p>Track Your Amaal &middot; Track your daily prayers and zikr</p>
            </footer>
        </div>
    );
}