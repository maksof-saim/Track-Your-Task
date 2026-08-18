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

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="min-w-[900px] w-full text-left text-sm">
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
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    u.role === "ADMIN"
                      ? "bg-gold-100 text-gold-600"
                      : "bg-primary-50 text-primary-600"
                  }`}
                >
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3 text-foreground/70">
                {new Date(u.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
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
  );
}
