"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";

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

export default function QazaCalculator() {
  const { t } = useI18n();
  const copy = t.public.calculator;
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

  function formatDuration(days: number): string {
    if (days < 30) return copy.durationDay(days);
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const parts: string[] = [];
    if (years) parts.push(copy.durationYear(years));
    if (months) parts.push(copy.durationMonth(months));
    return parts.join(", ");
  }

  const result = useMemo(() => {
    const start = parseIso(startDate);
    const end = parseIso(endDate);
    if (start === null || end === null) return { kind: "empty" as const };
    if (end <= start) return { kind: "error" as const };

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
      duration: formatDuration(Math.ceil(remainingDays / perDayCount)),
    };
  }, [startDate, endDate, excludedDays, madeUpDays, includeWitr, perDay]);

  const prayerNames = [
    t.meta.prayers.FAJR,
    t.meta.prayers.DHUHR,
    t.meta.prayers.ASR,
    t.meta.prayers.MAGHRIB,
    t.meta.prayers.ISHA,
    ...(includeWitr ? [copy.witr] : []),
  ];

  return (
    <div className="rounded-2xl border border-[#e3dcc8] bg-white p-5 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="qaza-start" className="mb-1 block text-sm font-medium text-[#3a4a45]">
            {copy.startLabel}
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
            {copy.endLabel}
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
            {copy.excludedLabel}
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
          <p className="mt-1 text-xs text-[#66726d]">{copy.excludedHint}</p>
        </div>
        <div>
          <label htmlFor="qaza-madeup" className="mb-1 block text-sm font-medium text-[#3a4a45]">
            {copy.madeUpLabel}
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
          <p className="mt-1 text-xs text-[#66726d]">{copy.madeUpHint}</p>
        </div>
        <div>
          <label htmlFor="qaza-perday" className="mb-1 block text-sm font-medium text-[#3a4a45]">
            {copy.perDayLabel}
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
            {copy.includeWitr}
          </label>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-[#f6f3ea] p-5" aria-live="polite">
        {result.kind === "empty" && (
          <p className="text-center text-sm text-[#66726d]">{copy.emptyHint}</p>
        )}

        {result.kind === "error" && (
          <p role="alert" className="text-center text-sm font-medium text-[#a33a2a]">
            {copy.errorDates}
          </p>
        )}

        {result.kind === "ok" && (
          <div>
            <p className="text-center text-sm text-[#66726d]">{copy.estimated}</p>
            <p className="mt-1 text-center text-4xl font-bold text-[#0b5d4b]">
              {copy.prayersValue(result.totalPrayers)}
            </p>
            <p className="mt-1 text-center text-sm text-[#3a4a45]">
              {copy.daysAndPerDay(result.remainingDays, result.prayersPerDay)}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {prayerNames.map((name) => (
                <div key={name} className="rounded-lg bg-white p-3 text-center">
                  <p className="text-xs text-[#66726d]">{name}</p>
                  <p className="text-lg font-bold text-[#084538]">{result.remainingDays}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 text-center text-sm text-[#3a4a45]">
              {result.remainingDays === 0
                ? copy.noRemaining
                : copy.plan(result.perDayCount, result.duration)}
            </p>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs leading-5 text-[#66726d]">
        {copy.disclaimer}{" "}
        <Link href="/register" className="font-medium text-[#0b5d4b] underline">
          {copy.createAccount}
        </Link>{" "}
        {copy.disclaimerTail}
      </p>
    </div>
  );
}
