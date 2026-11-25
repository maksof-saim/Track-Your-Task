"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PRESETS = [
  { id: "subhanallah", label: "SubhanAllah", arabic: "سُبْحَانَ ٱللَّٰهِ" },
  { id: "alhamdulillah", label: "Alhamdulillah", arabic: "ٱلْحَمْدُ لِلَّٰهِ" },
  { id: "allahuakbar", label: "Allahu Akbar", arabic: "ٱللَّٰهُ أَكْبَرُ" },
  { id: "astaghfirullah", label: "Astaghfirullah", arabic: "أَسْتَغْفِرُ ٱللَّٰهَ" },
  { id: "durood", label: "Durood Shareef", arabic: "" },
  { id: "any", label: "Any dhikr", arabic: "" },
] as const;

const TARGETS = [33, 99, 100, 500, 1000, 0];
const STORAGE_KEY = "tasbeeh-counter-v1";

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    // Vibration is optional and not supported on every device.
  }
}

export default function TasbeehCounter() {
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [target, setTarget] = useState(33);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { presetId?: string; target?: number; total?: number };
        if (PRESETS.some((preset) => preset.id === saved.presetId)) setPresetId(saved.presetId as string);
        if (typeof saved.target === "number" && TARGETS.includes(saved.target)) setTarget(saved.target);
        if (typeof saved.total === "number" && Number.isInteger(saved.total) && saved.total >= 0) {
          setTotal(saved.total);
        }
      }
    } catch {
      // Ignore unreadable saved data.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ presetId, target, total }));
    } catch {
      // Storage can be unavailable (private mode); counting still works.
    }
  }, [loaded, presetId, target, total]);

  const preset = PRESETS.find((item) => item.id === presetId) ?? PRESETS[0];
  const progress = target > 0 ? total % target : total;
  const rounds = target > 0 ? Math.floor(total / target) : 0;
  const roundJustCompleted = target > 0 && total > 0 && progress === 0;
  const shown = roundJustCompleted ? target : progress;

  function tap() {
    const next = total + 1;
    setTotal(next);
    if (target > 0 && next % target === 0) {
      vibrate([80, 60, 80]);
      setMessage(`Round ${next / target} complete`);
    } else {
      vibrate(12);
      setMessage("");
    }
  }

  function undo() {
    if (total === 0) return;
    setTotal(total - 1);
    setMessage("");
  }

  function reset() {
    if (total > 0 && !window.confirm("Reset the counter to zero?")) return;
    setTotal(0);
    setMessage("");
  }

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8963e] focus-visible:ring-offset-2";

  return (
    <div className="rounded-2xl border border-[#e3dcc8] bg-white p-5 sm:p-8">
      <div className="mb-5 flex flex-wrap justify-center gap-2" role="group" aria-label="Choose dhikr">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === presetId}
            onClick={() => setPresetId(item.id)}
            className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${focusRing} ${
              item.id === presetId
                ? "border-[#0b5d4b] bg-[#0b5d4b] text-white"
                : "border-[#d9d2bc] bg-white text-[#0b5d4b] hover:border-[#0b5d4b]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-4 text-center">
        {preset.arabic && (
          <p dir="rtl" lang="ar" className="text-3xl leading-relaxed text-[#084538]">
            {preset.arabic}
          </p>
        )}
        <p className="text-sm text-[#66726d]">{preset.label}</p>
      </div>

      <button
        type="button"
        onClick={tap}
        aria-label={`Count one ${preset.label}. Current count ${shown}`}
        className={`mx-auto flex h-56 w-56 touch-manipulation select-none flex-col items-center justify-center rounded-full bg-[#0b5d4b] text-white shadow-lg transition-transform active:scale-95 sm:h-64 sm:w-64 ${focusRing}`}
      >
        <span className="text-6xl font-bold tabular-nums">{shown}</span>
        {target > 0 && <span className="mt-1 text-sm text-[#e3cf9a]">of {target}</span>}
      </button>

      <p aria-live="polite" className="mt-4 min-h-6 text-center text-base font-semibold text-[#b8963e]">
        {message}
      </p>

      <p className="mb-5 text-center text-sm text-[#66726d]">
        {target > 0 ? `Rounds completed: ${rounds} · ` : ""}Total count: {total}
      </p>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <label className="flex items-center gap-2 text-sm text-[#3a4a45]">
          Target
          <select
            value={target}
            onChange={(event) => setTarget(Number(event.target.value))}
            className={`min-h-11 rounded-lg border border-[#d9d2bc] bg-white px-3 text-sm ${focusRing}`}
          >
            {TARGETS.map((value) => (
              <option key={value} value={value}>
                {value === 0 ? "No target" : value}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={undo}
            disabled={total === 0}
            className={`min-h-11 rounded-lg border border-[#0b5d4b] px-5 text-sm font-semibold text-[#0b5d4b] hover:bg-[#f6f3ea] disabled:opacity-40 ${focusRing}`}
          >
            Undo
          </button>
          <button
            type="button"
            onClick={reset}
            className={`min-h-11 rounded-lg border border-[#a33a2a] px-5 text-sm font-semibold text-[#a33a2a] hover:bg-[#fbeeee] ${focusRing}`}
          >
            Reset
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-[#66726d]">
        Your count is saved on this device only.{" "}
        <Link href="/register" className="font-medium text-[#0b5d4b] underline">
          Create an account
        </Link>{" "}
        to record your daily dhikr and see your progress over time.
      </p>
    </div>
  );
}