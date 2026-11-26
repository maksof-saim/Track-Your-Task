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
    setMessage(null);
    setDevelopmentResetUrl(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setMessage(data.message);
        setDevelopmentResetUrl(data.developmentResetUrl ?? null);
      }
    } catch {
      setError("Could not reach the server. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <img
          src="/logo-horizontal.svg"
          alt="Track Your Amaal"
          className="h-12 w-auto"
        />
      </div>
      <h2 className="mb-1 text-lg font-semibold text-foreground">Forgot Password?</h2>
      <p className="mb-6 text-sm text-foreground/60">
        Enter your email and we&apos;ll send you a secure reset link.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground/80">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="you@example.com"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-status-qaza">
            {error}
          </p>
        )}
        {message && (
          <div className="text-sm text-primary-500">
            <p>{message}</p>
            <p className="mt-1 text-xs text-foreground/60">
              If you do not see the email within a few minutes, please check your Spam or Junk
              folder.
            </p>
          </div>
        )}
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
