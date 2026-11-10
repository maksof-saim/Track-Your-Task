import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
    themeColor: "#0b5d4b",
};

const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8963e] focus-visible:ring-offset-2";

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
        <div className="min-h-screen overflow-x-clip bg-[#f6f3ea] pb-24 text-[#23302c] sm:pb-0">
            <header className="sticky top-0 z-30 bg-[#0b5d4b] shadow-sm">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
                    <Link
                        href="/"
                        aria-label="Track Your Amaal home"
                        className={`flex min-w-0 items-center gap-2 rounded-md ${focusRing}`}
                    >
                        <Image
                            src="/icon-192.png"
                            alt=""
                            width={36}
                            height={36}
                            priority
                            className="h-8 w-8 shrink-0 rounded-lg sm:h-9 sm:w-9"
                        />
                        <span className="truncate text-base font-bold text-white sm:text-lg">
                            Track Your Amaal
                        </span>
                    </Link>
                    <nav aria-label="Main" className="flex shrink-0 items-center gap-1 sm:gap-3">
                        <Link
                            href="/login"
                            className={`hidden min-h-11 items-center rounded-md px-3 text-sm font-medium text-[#e3cf9a] hover:text-white min-[420px]:inline-flex ${focusRing}`}
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/register"
                            className={`inline-flex min-h-11 items-center rounded-md bg-[#b8963e] px-4 text-sm font-semibold text-[#062e24] hover:bg-[#c9a74f] ${focusRing}`}
                        >
                            Get started
                        </Link>
                    </nav>
                </div>
                <div className="h-1 bg-[#b8963e]" />
            </header>

            <main>
                <section className="mx-auto max-w-3xl px-5 pb-12 pt-12 text-center sm:px-6 sm:pb-20 sm:pt-20">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#7a5f17] sm:text-sm">
                        Prayers and zikr tracker
                    </p>
                    <h1 className="text-balance text-3xl font-bold leading-tight text-[#084538] sm:text-4xl md:text-5xl">
                        Build the habit of worship, one day at a time
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#4a5a55] sm:mt-5 sm:text-lg sm:leading-8">
                        Track your daily salah, dhikr, Quran reading and self-accountability in one place, and
                        watch your consistency grow.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/register"
                            className={`inline-flex min-h-12 items-center justify-center rounded-lg bg-[#0b5d4b] px-8 text-base font-semibold text-white hover:bg-[#084538] ${focusRing}`}
                        >
                            Create your account
                        </Link>
                        <Link
                            href="/login"
                            className={`inline-flex min-h-12 items-center justify-center rounded-lg border border-[#0b5d4b] px-8 text-base font-semibold text-[#0b5d4b] hover:bg-white ${focusRing}`}
                        >
                            Sign in
                        </Link>
                    </div>
                </section>

                <section id="features" className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
                    <h2 className="mb-6 text-balance text-center text-xl font-bold text-[#084538] sm:mb-8 sm:text-2xl">
                        Everything you need for your daily amaal
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                        {features.map((feature) => (
                            <article
                                key={feature.title}
                                className="rounded-xl border border-[#e3dcc8] border-t-4 border-t-[#b8963e] bg-white p-5 sm:p-6"
                            >
                                <h3 className="mb-2 text-lg font-bold text-[#0b5d4b]">{feature.title}</h3>
                                <p className="text-base leading-7 text-[#4a5a55]">{feature.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="bg-white px-4 py-12 sm:px-6 sm:py-16">
                    <div className="mx-auto max-w-5xl">
                        <h2 className="mb-8 text-center text-xl font-bold text-[#084538] sm:text-2xl">
                            How it works
                        </h2>
                        <ol className="space-y-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0">
                            {steps.map((step, index) => (
                                <li
                                    key={step.title}
                                    className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b5d4b] font-bold text-white">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h3 className="mb-1 text-lg font-bold text-[#0b5d4b]">{step.title}</h3>
                                        <p className="text-base leading-7 text-[#4a5a55]">{step.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="mx-auto max-w-3xl px-5 py-12 text-center sm:px-6 sm:py-16">
                    <h2 className="text-balance text-xl font-bold text-[#084538] sm:text-2xl">
                        Start tracking your amaal today
                    </h2>
                    <p className="mt-3 text-base leading-7 text-[#4a5a55]">
                        Small, consistent deeds are beloved to Allah. Make them easy to see and easy to keep.
                    </p>
                    <Link
                        href="/register"
                        className={`mt-6 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-lg bg-[#0b5d4b] px-8 text-base font-semibold text-white hover:bg-[#084538] ${focusRing}`}
                    >
                        Get started
                    </Link>
                </section>
            </main>

            <footer className="bg-[#084538] px-5 py-8 text-center text-sm text-[#e3cf9a]">
                <p className="text-base font-semibold text-white">Track Your Amaal</p>
                <p className="mt-1">Track your daily prayers and zikr</p>
                <nav aria-label="Footer" className="mt-3 flex justify-center gap-6">
                    <Link href="/login" className={`inline-flex min-h-11 items-center rounded-md hover:text-white ${focusRing}`}>
                        Sign in
                    </Link>
                    <Link href="/register" className={`inline-flex min-h-11 items-center rounded-md hover:text-white ${focusRing}`}>
                        Create account
                    </Link>
                </nav>
                <p className="mt-3 text-xs opacity-80">&copy; {new Date().getFullYear()} Track Your Amaal</p>
            </footer>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e3dcc8] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:hidden">
                <Link
                    href="/register"
                    className={`inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#0b5d4b] text-base font-semibold text-white ${focusRing}`}
                >
                    Create your account
                </Link>
            </div>
        </div>
    );
}