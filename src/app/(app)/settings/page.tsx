"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { setLocaleCookie, useI18n } from "@/lib/i18n/client";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";

type Account = {
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    createdAt: string;
    hasPassword: boolean;
};

export default function SettingsPage() {
    const router = useRouter();
    const { locale, t } = useI18n();
    const [account, setAccount] = useState<Account | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [password, setPassword] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/account")
            .then((res) => {
                if (!res.ok) throw new Error("Request failed");
                return res.json();
            })
            .then((data) => {
                if (!cancelled) setAccount(data);
            })
            .catch(() => {
                if (!cancelled) setLoadError(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    function changeLocale(next: Locale) {
        if (next === locale) return;
        setLocaleCookie(next);
        router.refresh();
    }

    async function handleDelete(event: FormEvent) {
        event.preventDefault();
        if (!account) return;

        if (confirmText !== "DELETE") {
            toast.error(t.settings.typeDelete);
            return;
        }
        if (account.hasPassword && !password) {
            toast.error(t.settings.passwordRequired);
            return;
        }
        const sure = window.confirm(t.settings.deleteConfirm);
        if (!sure) return;

        setDeleting(true);
        try {
            const res = await fetch("/api/account", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirm: confirmText, password }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                toast.error(t.settings.deleteFail, {
                    description: data.error || t.settings.deleteFailHint,
                });
                return;
            }

            toast.success(t.settings.deleted);
            await signOut({ callbackUrl: "/" });
        } catch {
            toast.error(t.settings.deleteFail, {
                description: t.settings.deleteFailHint,
            });
        } finally {
            setDeleting(false);
        }
    }

    const memberSince = account
        ? new Date(account.createdAt).toLocaleDateString(locale === "ur" ? "ur-PK" : "en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "";

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-foreground">{t.settings.title}</h1>
                <p className="text-sm text-foreground/60">{t.settings.subtitle}</p>
            </div>

            <section className="mb-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
                <h2 className="mb-1 text-sm font-semibold text-foreground/70">{t.settings.language}</h2>
                <p className="mb-3 text-sm text-foreground/60">{t.settings.languageHint}</p>
                <div className="flex flex-wrap gap-2">
                    {LOCALES.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => changeLocale(option)}
                            aria-pressed={locale === option}
                            lang={option}
                            className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${locale === option
                                ? "border-primary-500 bg-primary-50 text-primary-600"
                                : "border-border text-foreground/70 hover:border-primary-300"
                                }`}
                        >
                            {LOCALE_LABELS[option]}
                        </button>
                    ))}
                </div>
            </section>

            <section className="mb-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
                <h2 className="mb-3 text-sm font-semibold text-foreground/70">{t.settings.yourDetails}</h2>
                {loadError ? (
                    <p className="text-sm text-status-qaza">{t.settings.loadError}</p>
                ) : !account ? (
                    <p className="text-sm text-foreground/60">{t.settings.loading}</p>
                ) : (
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-xs text-foreground/50">{t.settings.name}</dt>
                            <dd className="break-words font-medium text-foreground">{account.name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-foreground/50">{t.settings.email}</dt>
                            <dd className="break-all font-medium text-foreground">{account.email}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-foreground/50">{t.settings.memberSince}</dt>
                            <dd className="font-medium text-foreground">{memberSince}</dd>
                        </div>
                    </dl>
                )}
            </section>

            <section className="mb-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
                <h2 className="mb-1 text-sm font-semibold text-foreground/70">{t.settings.yourData}</h2>
                <p className="mb-3 text-sm text-foreground/60">
                    {t.settings.yourDataHint}
                </p>
                <a
                    href="/api/account/export"
                    className="inline-flex min-h-11 items-center rounded-lg border border-primary-500 px-4 py-2 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50"
                >
                    {t.settings.downloadData}
                </a>
            </section>

            <section className="rounded-xl border border-status-qaza/40 bg-surface p-4 sm:p-5">
                <h2 className="mb-1 text-sm font-semibold text-status-qaza">{t.settings.deleteTitle}</h2>
                <p className="mb-3 text-sm text-foreground/60">
                    {t.settings.deleteHint}
                </p>

                {account?.role === "ADMIN" ? (
                    <p className="text-sm text-foreground/60">
                        {t.settings.adminNoDelete}
                    </p>
                ) : (
                    <form onSubmit={handleDelete} className="flex flex-col gap-3">
                        <div>
                            <label htmlFor="confirm-delete" className="mb-1 block text-sm font-medium text-foreground/80">
                                {t.settings.deleteConfirmLabel}
                            </label>
                            <input
                                id="confirm-delete"
                                type="text"
                                autoComplete="off"
                                autoCapitalize="characters"
                                autoCorrect="off"
                                spellCheck={false}
                                value={confirmText}
                                onChange={(event) => setConfirmText(event.target.value)}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                            />
                        </div>

                        {account?.hasPassword && (
                            <div>
                                <label htmlFor="delete-password" className="mb-1 block text-sm font-medium text-foreground/80">
                                    {t.settings.deletePasswordLabel}
                                </label>
                                <input
                                    id="delete-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={deleting || !account || confirmText !== "DELETE"}
                            className="flex min-h-11 items-center justify-center rounded-lg bg-status-qaza px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
                        >
                            {deleting ? t.settings.deleting : t.settings.deleteButton}
                        </button>
                    </form>
                )}
            </section>
        </div>
    );
}