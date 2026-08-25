"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [developmentResetUrl, setDevelopmentResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(null); setMessage(null); setDevelopmentResetUrl(null);
    const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) setError(data.error ?? "Kuch ghalat ho gaya");
    else { setMessage(data.message); setDevelopmentResetUrl(data.developmentResetUrl ?? null); }
  }

  return <div><h2 className="mb-1 text-lg font-semibold text-foreground">Password bhool gaye?</h2><p className="mb-6 text-sm text-foreground/60">Apna email dein, hum aapko secure reset link bhej denge.</p><form onSubmit={submit} className="flex flex-col gap-4"><div><label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground/80">Email</label><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" placeholder="aap@example.com" /></div>{error && <p className="text-sm text-status-qaza">{error}</p>}{message && <p className="text-sm text-primary-500">{message}</p>}{developmentResetUrl && <div className="rounded-lg border border-gold-400/40 bg-gold-100 p-3 text-sm text-foreground"><p className="mb-1 font-semibold">Local testing link:</p><a href={developmentResetUrl} className="break-all font-medium text-primary-500 underline">Password reset karein</a><p className="mt-2 text-xs text-foreground/60">Production mein ye link email par hi bheja jayega.</p></div>}<button type="submit" disabled={loading} className="rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60">{loading ? "Link bheja ja raha hai..." : "Reset link bhejein"}</button></form><p className="mt-6 text-center text-sm text-foreground/60"><Link href="/login" className="font-medium text-primary-500 hover:underline">Login par wapas jayein</Link></p></div>;
}
