"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const MS_DAY = 24 * 60 * 60 * 1000;

const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8963e] focus-visible:ring-offset-2";
const inputClass = `min-h-11 w-full rounded-lg border border-[#d9d2bc] bg-white px-3 text-base ${focusRing}`;

function parseIso(value: string): number | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    const time = Date.UTC(year, month - 1, day);
    const check = new Date(time);
    if (
        check.getUTCFullYear() !== year ||
        check.getUTCMonth() !== month - 1 ||
        check.getUTCDate() !== day
    ) {
        return null;
    }
    return time;
}

function toInt(value: string): number {
    const number = Math.floor(Number(value));
    return Number.isFinite(number) && number > 0 ? number : 0;
}

function localTodayIso(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

function formatDuration(days: number): string {
    if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const parts: string[] = [];
    if (years) parts.push(`${years} year${years === 1 ? "" : "s"}`);
    if (months) parts.push(`${months} month${months === 1 ? "" : "s"}`);
    return parts.join(", ");
}

export default function QazaCalculator() {
    const [today, setToday] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [excludedDays, setExcludedDays] = useState("");
    const [madeUpDays, setMadeUpDays] = useState("");
    const [includeWitr, setIncludeWitr] = useState(true);
    const [perDay, setPerDay] = useState("1");

    useEffect(() => {
        const current = localTodayIso();
        setToday(current);
        setEndDate(current);
    }, []);

    const result = useMemo(() => {
        const start = parseIso(startDate);
        const end = parseIso(endDate);
        if (start === null || end === null) return { kind: "empty" as const };
        if (end <= start) {
            return {
                kind: "error" as const,
                message:
                    "The date you started praying regularly must be after the date prayer became obligatory for you.",
            };
        }

        const totalDays = Math.round((end - start) / MS_DAY);
        const excluded = Math.min(toInt(excludedDays), totalDays);
        const afterExcluded = totalDays - excluded;
        const madeUp = Math.min(toInt(madeUpDays), afterExcluded);
        const remainingDays = afterExcluded - madeUp;
        const prayersPerDay = includeWitr ? 6 : 5;
        const perDayCount = Math.max(1, toInt(perDay));

        return {
            kind: "ok" as const,
            totalDays,
            excluded,
            madeUp,
            remainingDays,
            prayersPerDay,
            totalPrayers: remainingDays * prayersPerDay,
            perDayCount,
            daysToFinish: Math.ceil(remainingDays / perDayCount),
        };
    }, [startDate, endDate, excludedDays, madeUpDays, includeWitr, perDay]);

    const prayerNames = includeWitr
        ? ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha", "Witr"]
        : ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"];

    return (
        <div className="rounded-2xl border border-[#e3dcc8] bg-white p-5 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="qaza-start" className="mb-1 block text-sm font-medium text-[#3a4a45]">
                        Date prayer became obligatory for you
                    </label>
                    <input
                        id="qaza-start"
                        type="date"
                        value={startDate}
                        max={endDate || today}
                        onChange={(event) => setStartDate(event.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="qaza-end" className="mb-1 block text-sm font-medium text-[#3a4a45]">
                        Date you started praying regularly
                    </label>
                    <input
                        id="qaza-end"
                        type="date"
                        value={endDate}
                        max={today}
                        onChange={(event) => setEndDate(event.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="qaza-excluded" className="mb-1 block text-sm font-medium text-[#3a4a45]">
                        Days to exclude (optional)
                    </label>
                    <input
                        id="qaza-excluded"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={excludedDays}
                        onChange={(event) => setExcludedDays(event.target.value)}
                        placeholder="0"
                        className={inputClass}
                    />
                    <p className="mt-1 text-xs text-[#66726d]">
                        Days on which prayer was not obligatory for you, for example during menstruation.
                    </p>
                </div>
                <div>
                    <label htmlFor="qaza-madeup" className="mb-1 block text-sm font-medium text-[#3a4a45]">
                        Days of Qaza already made up (optional)
                    </label>
                    <input
                        id="qaza-madeup"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={madeUpDays}
                        onChange={(event) => setMadeUpDays(event.target.value)}
                        placeholder="0"
                        className={inputClass}
                    />
                    <p className="mt-1 text-xs text-[#66726d]">Count whole days, meaning all the prayers of a day.</p>
                </div>
                <div>
                    <label htmlFor="qaza-perday" className="mb-1 block text-sm font-medium text-[#3a4a45]">
                        Qaza days you can make up each day
                    </label>
                    <input
                        id="qaza-perday"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        value={perDay}
                        onChange={(event) => setPerDay(event.target.value)}
                        className={inputClass}
                    />
                </div>
                <div className="flex items-end">
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[#3a4a45]">
                        <input
                            type="checkbox"
                            checked={includeWitr}
                            onChange={(event) => setIncludeWitr(event.target.checked)}
                            className="h-5 w-5 rounded border-[#d9d2bc] accent-[#0b5d4b]"
                        />
                        Include Witr (as in the Hanafi school)
                    </label>
                </div>
            </div>

            <div className="mt-8 rounded-xl bg-[#f6f3ea] p-5" aria-live="polite">
                {result.kind === "empty" && (
                    <p className="text-center text-sm text-[#66726d]">
                        Choose both dates to see your estimate.
                    </p>
                )}

                {result.kind === "error" && (
                    <p role="alert" className="text-center text-sm font-medium text-[#a33a2a]">
                        {result.message}
                    </p>
                )}

                {result.kind === "ok" && (
                    <div>
                        <p className="text-center text-sm text-[#66726d]">Estimated Qaza remaining</p>
                        <p className="mt-1 text-center text-4xl font-bold text-[#0b5d4b]">
                            {result.totalPrayers.toLocaleString("en-US")} prayers
                        </p>
                        <p className="mt-1 text-center text-sm text-[#3a4a45]">
                            {result.remainingDays.toLocaleString("en-US")} days · {result.prayersPerDay} prayers a day
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {prayerNames.map((name) => (
                                <div key={name} className="rounded-lg bg-white p-3 text-center">
                                    <p className="text-xs text-[#66726d]">{name}</p>
                                    <p className="text-lg font-bold text-[#084538]">
                                        {result.remainingDays.toLocaleString("en-US")}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p className="mt-5 text-center text-sm text-[#3a4a45]">
                            {result.remainingDays === 0
                                ? "No Qaza remaining for these dates."
                                : `At ${result.perDayCount} day${result.perDayCount === 1 ? "" : "s"} of Qaza each day, this would take about ${formatDuration(result.daysToFinish)}.`}
                        </p>
                    </div>
                )}
            </div>

            <p className="mt-5 text-xs leading-5 text-[#66726d]">
                This is only an estimate to help you plan. Rulings differ between schools of thought and
                depend on your situation, so please ask a qualified scholar about your own case.{" "}
                <Link href="/register" className="font-medium text-[#0b5d4b] underline">
                    Create an account
                </Link>{" "}
                to record your daily prayers and Qaza in {`Track Your Amaal`}.
            </p>
        </div>
    );
}