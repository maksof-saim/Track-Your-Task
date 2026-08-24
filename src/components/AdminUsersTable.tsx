"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  analytics: {
    todayLoggedCount: number;
    totalPrayers: number;
    streak: number;
    jamaatPercent: number;
    zikrToday: number;
    tilawatToday: number;
    tilawatTarget: number;
    hifazatToday: number;
    hifazatTarget: number;
  };
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RoleBadge({ role }: { role: AdminUser["role"] }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        role === "ADMIN"
          ? "bg-gold-100 text-gold-600"
          : "bg-primary-50 text-primary-600"
      }`}
    >
      {role}
    </span>
  );
}

export default function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Load nahi ho saka");
        }
        return res.json();
      })
      .then((data) => setUsers(data.users))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p className="text-sm text-status-qaza">{error}</p>;
  }

  if (!users) {
    return <p className="text-sm text-foreground/50">Load ho raha hai...</p>;
  }

  if (users.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-foreground/50">
        Abhi tak koi user register nahi hua.
      </p>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards, no horizontal scroll */}
      <div className="flex flex-col gap-3 sm:hidden">
        {users.map((u) => (
          <div
            key={u.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{u.name}</p>
                <p className="truncate text-xs text-foreground/60">{u.email}</p>
              </div>
              <RoleBadge role={u.role} />
            </div>

            <p className="mt-1.5 text-[11px] text-foreground/50">
              Join Date: {formatDate(u.createdAt)}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-border pt-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-foreground/45">
                  Aaj ki Namaz
                </p>
                <p className="text-sm font-medium text-foreground">
                  {u.analytics.todayLoggedCount}/{u.analytics.totalPrayers}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-foreground/45">
                  Streak
                </p>
                <p className="text-sm font-medium text-foreground">
                  {u.analytics.streak} din
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-foreground/45">
                  Jamaat %
                </p>
                <p className="text-sm font-medium text-foreground">
                  {u.analytics.jamaatPercent}%
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-foreground/45">
                  Aaj ka Zikr
                </p>
                <p className="text-sm font-medium text-foreground">
                  {u.analytics.zikrToday}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-foreground/45">
                  Tilawat
                </p>
                <p className="text-sm font-medium text-foreground">
                  {u.analytics.tilawatToday}/{u.analytics.tilawatTarget}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-foreground/45">
                  Hifazat
                </p>
                <p className="text-sm font-medium text-foreground">
                  {u.analytics.hifazatToday}/{u.analytics.hifazatTarget}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / tablet: full table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface sm:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-foreground/50">
              <th className="px-4 py-3 font-medium">Naam</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Join Date</th>
              <th className="px-4 py-3 font-medium">Aaj ki Namaz</th>
              <th className="px-4 py-3 font-medium">Streak</th>
              <th className="px-4 py-3 font-medium">Jamaat %</th>
              <th className="px-4 py-3 font-medium">Aaj ka Zikr</th>
              <th className="px-4 py-3 font-medium">Tilawat</th>
              <th className="px-4 py-3 font-medium">Hifazat</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                <td className="px-4 py-3 text-foreground/70">{u.email}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {u.analytics.todayLoggedCount}/{u.analytics.totalPrayers}
                </td>
                <td className="px-4 py-3 text-foreground">{u.analytics.streak} din</td>
                <td className="px-4 py-3 text-foreground">{u.analytics.jamaatPercent}%</td>
                <td className="px-4 py-3 text-foreground">{u.analytics.zikrToday}</td>
                <td className="px-4 py-3 text-foreground">
                  {u.analytics.tilawatToday}/{u.analytics.tilawatTarget}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {u.analytics.hifazatToday}/{u.analytics.hifazatTarget}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
