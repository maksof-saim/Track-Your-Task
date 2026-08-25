"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

export default function ResetPasswordPage() { return <Suspense fallback={null}><ResetForm /></Suspense>; }
function ResetForm() {
  const params = useSearchParams(); const token = params.get("token") ?? "";
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [error, setError] = useState<string | null>(null); const [done, setDone] = useState(false); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setError(null); if (password !== confirm) { setError("Passwords match nahi karte"); return; } setLoading(true); const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); const data = await response.json().catch(() => ({})); setLoading(false); if (!response.ok) setError(data.error ?? "Reset link invalid hai"); else setDone(true); }
  if (done) return <div><h2 className="mb-2 text-lg font-semibold text-foreground">Password update ho gaya</h2><p className="text-sm text-foreground/60">Ab naye password ke saath login kar sakte hain.</p><Link href="/login" className="mt-6 block text-center font-medium text-primary-500 hover:underline">Login karein</Link></div>;
  return <div><h2 className="mb-1 text-lg font-semibold text-foreground">Naya password set karein</h2><p className="mb-6 text-sm text-foreground/60">Kam az kam 8 characters ka strong password rakhein.</p><form onSubmit={submit} className="flex flex-col gap-4"><input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400" placeholder="Naya password" /><input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400" placeholder="Password dobara likhein" />{error && <p className="text-sm text-status-qaza">{error}</p>}<button type="submit" disabled={loading || !token} className="rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60">{loading ? "Update ho raha hai..." : "Password update karein"}</button></form></div>;
}
