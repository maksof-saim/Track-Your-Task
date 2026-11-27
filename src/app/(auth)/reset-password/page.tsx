"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const params = useSearchParams();
  const { t } = useI18n();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    // Client-side validation
    if (!password) {
      setError(t.auth.enterPassword);
      return;
    }
    if (password.length < 8) {
      setError(t.auth.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(t.auth.passwordsDoNotMatch);
      return;
    }
    if (!token) {
      setError(t.auth.resetLinkInvalid);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) setError(data.error ?? t.auth.resetLinkInvalid);
      else setDone(true);
    } catch {
      setError(t.auth.serverUnreachable);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div>
        <div className="mb-6 flex justify-center">
          <img
            src="/logo-horizontal.svg"
            alt="Track Your Amaal"
            className="h-12 w-auto"
          />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          {t.auth.updatedTitle}
        </h2>
        <p className="mb-2 text-sm text-foreground/60">{t.auth.updatedSubtitle}</p>
        <p className="mb-6 text-xs text-foreground/50">{t.auth.signedOutOthers}</p>
        <Link
          href="/login"
          className="mt-6 block text-center font-medium text-primary-500 hover:underline"
        >
          {t.auth.signIn}
        </Link>
      </div>
    );
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
      <h2 className="mb-1 text-lg font-semibold text-foreground">
        {t.auth.resetTitle}
      </h2>
      <p className="mb-6 text-sm text-foreground/60">{t.auth.resetSubtitle}</p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground/80">
            {t.auth.newPassword}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 pe-16 ps-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder={t.auth.newPasswordPlaceholder}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
              className="absolute inset-y-0 end-0 flex min-w-14 items-center justify-center px-3 text-xs font-medium text-foreground/60 hover:text-foreground"
            >
              {showPassword ? t.auth.hide : t.auth.show}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-foreground/80">
            {t.auth.confirmPassword}
          </label>
          <input
            id="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder={t.auth.confirmPasswordPlaceholder}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-status-qaza">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !token}
          className="flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {loading ? (
            <>
              <div className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t.auth.updating}
            </>
          ) : (
            t.auth.updatePassword
          )}
        </button>
      </form>
    </div>
  );
}
