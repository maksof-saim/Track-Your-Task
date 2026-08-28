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
    event.preventDefault();
    setError(null);

    // Client-side validation
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setDevelopmentResetUrl(null);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) setError(data.error ?? "Something went wrong");
    else {
      setMessage(data.message);
      setDevelopmentResetUrl(data.developmentResetUrl ?? null);
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-foreground">Forgot Password?</h2>
      <p className="mb-6 text-sm text-foreground/60">
        Enter your email and we'll send you a secure reset link.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground/80">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="you@example.com"
          />
        </div>
        {error && <p className="text-sm text-status-qaza">{error}</p>}
        {message && <p className="text-sm text-primary-500">{message}</p>}
        {developmentResetUrl && (
          <div className="rounded-lg border border-gold-400/40 bg-gold-100 p-3 text-sm text-foreground">
            <p className="mb-1 font-semibold">Local testing link:</p>
            <a
              href={developmentResetUrl}
              className="break-all font-medium text-primary-500 underline"
            >
              Reset password
            </a>
            <p className="mt-2 text-xs text-foreground/60">
              In production, this link will be sent via email.
            </p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Sending link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-foreground/60">
        <Link href="/login" className="font-medium text-primary-500 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

