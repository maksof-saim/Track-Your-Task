"use client";

import { useEffect, useState, type FormEvent } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

type Account = {
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    createdAt: string;
    hasPassword: boolean;
};

export default function SettingsPage() {
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

    async function handleDelete(event: FormEvent) {
        event.preventDefault();
        if (!account) return;

        if (confirmText !== "DELETE") {
            toast.error("Type DELETE to confirm");
            return;
        }
        if (account.hasPassword && !password) {
            toast.error("Please enter your password");
            return;
        }
        const sure = window.confirm(
            "This permanently deletes your account and all your records. This cannot be undone. Continue?",
        );
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
                toast.error("Could not delete account", {
                    description: data.error || "Please try again.",
                });
                return;
            }

            toast.success("Your account has been deleted");
            await signOut({ callbackUrl: "/" });
        } catch {
            toast.error("Could not delete account", {
                description: "Please check your internet connection and try again.",
            });
        } finally {
            setDeleting(false);
        }
    }

    const memberSince = account
        ? new Date(account.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "";

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-foreground">Account</h1>
                <p className="text-sm text-foreground/60">Your details, your data and your account</p>
            </div>

            <section className="mb-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
                <h2 className="mb-3 text-sm font-semibold text-foreground/70">Your details</h2>
                {loadError ? (
                    <p className="text-sm text-status-qaza">Could not load your details. Please refresh the page.</p>
                ) : !account ? (
                    <p className="text-sm text-foreground/60">Loading...</p>
                ) : (
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-xs text-foreground/50">Name</dt>
                            <dd className="break-words font-medium text-foreground">{account.name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-foreground/50">Email</dt>
                            <dd className="break-all font-medium text-foreground">{account.email}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-foreground/50">Member since</dt>
                            <dd className="font-medium text-foreground">{memberSince}</dd>
                        </div>
                    </dl>
                )}
            </section>

            <section className="mb-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
                <h2 className="mb-1 text-sm font-semibold text-foreground/70">Your data</h2>
                <p className="mb-3 text-sm text-foreground/60">
                    Download a copy of your prayer, zikr, tilawat and hifazat records as a JSON file.
                </p>
                <a
                    href="/api/account/export"
                    className="inline-flex min-h-11 items-center rounded-lg border border-primary-500 px-4 py-2 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50"
                >
                    Download my data
                </a>
            </section>

            <section className="rounded-xl border border-status-qaza/40 bg-surface p-4 sm:p-5">
                <h2 className="mb-1 text-sm font-semibold text-status-qaza">Delete account</h2>
                <p className="mb-3 text-sm text-foreground/60">
                    This permanently deletes your account and every record linked to it. It cannot be undone.
                    You may want to download your data first.
                </p>

                {account?.role === "ADMIN" ? (
                    <p className="text-sm text-foreground/60">
                        Administrator accounts cannot be deleted from this page.
                    </p>
                ) : (
                    <form onSubmit={handleDelete} className="flex flex-col gap-3">
                        <div>
                            <label htmlFor="confirm-delete" className="mb-1 block text-sm font-medium text-foreground/80">
                                Type DELETE to confirm
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
                                    Your password
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
                            {deleting ? "Deleting..." : "Delete my account"}
                        </button>
                    </form>
                )}
            </section>
        </div>
    );
}