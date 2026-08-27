"use client";

import { useEffect, useState, useCallback } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  analytics: {
    todayLoggedCount: number;
    totalPrayers: number;
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
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${role === "ADMIN"
        ? "bg-gradient-to-r from-gold-100 to-gold-200 text-gold-700 border border-gold-300"
        : "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200"
        }`}
    >
      {role}
    </span>
  );
}

export default function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchUsers = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (dateFilter) params.append("date", dateFilter);

    fetch(`/api/admin/users?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Load nahi ho saka");
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data.users);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, dateFilter]);

  if (error) {
    return (
      <div className="rounded-2xl border border-status-qaza/30 bg-status-qaza/5 p-8 text-center">
        <p className="text-status-qaza font-medium">{error}</p>
      </div>
    );
  }

  if (!users) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-surface p-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="text-sm text-foreground/60">Data load ho raha hai...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-12 text-center">
        <div className="mb-4 text-4xl">👥</div>
        <p className="text-lg font-medium text-foreground">Abhi tak koi user register nahi hua.</p>
        <p className="mt-2 text-sm text-foreground/50">Jab koi user register karega, yahan data dikhega.</p>
      </div>
    );
  }

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.analytics.todayLoggedCount > 0).length || 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search & Filters - Always at top */}
      <div className="rounded-xl border border-border bg-surface p-3 shadow-sm sm:rounded-2xl sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 pl-9 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 sm:rounded-xl sm:px-4 sm:py-2.5 sm:pl-10"
              />
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40 sm:left-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="relative">
              <label className="mb-1 block text-xs font-medium text-foreground/60 sm:sr-only">Join Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 sm:rounded-xl sm:px-4 sm:py-2.5 sm:w-auto"
              />
            </div>
          </div>
          {(searchQuery || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setDateFilter("");
              }}
              className="rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors sm:rounded-xl sm:px-4 sm:py-2.5"
            >
              Clear Filters
            </button>
          )}
        </div>
        {users && users.length > 0 && (
          <p className="mt-2 text-[11px] text-foreground/50 sm:mt-3 sm:text-xs">
            Showing {users.length} users
          </p>
        )}
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-primary-500/5 via-primary-500/10 to-primary-600/5 p-3 shadow-sm sm:rounded-xl sm:p-4">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary-500/10" />
          <div className="relative">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 sm:h-10 sm:w-10">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-[10px] font-medium text-foreground/60 sm:text-[11px]">Total Users</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">{totalUsers}</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-green-500/5 via-green-500/10 to-green-600/5 p-3 shadow-sm sm:rounded-xl sm:p-4">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-green-500/10" />
          <div className="relative">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600 sm:h-10 sm:w-10">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[10px] font-medium text-foreground/60 sm:text-[11px]">Active Today</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">{activeUsers}</p>
          </div>
        </div>
      </div>

      {/* User List */}
      {!users ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-surface p-8 sm:rounded-2xl sm:p-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <p className="text-sm text-foreground/60">Loading...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center sm:rounded-2xl sm:p-12">
          <div className="mb-4 text-4xl">🔍</div>
          <p className="text-base font-medium text-foreground sm:text-lg">No users found</p>
          <p className="mt-2 text-sm text-foreground/50">Try changing your filters</p>
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards, no horizontal scroll */}
          <div className="flex flex-col gap-2 sm:hidden">
            {users.map((u) => (
              <div
                key={u.id}
                className="overflow-hidden rounded-lg border border-border bg-gradient-to-br from-surface to-surface-muted/30 p-3 shadow-sm transition-all hover:shadow-md hover:border-primary-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground text-sm">{u.name}</p>
                    <p className="truncate text-[11px] text-foreground/60">{u.email}</p>
                  </div>
                  <RoleBadge role={u.role} />
                </div>

                <p className="mt-1 text-[10px] text-foreground/50">
                  Joined: {formatDate(u.createdAt)}
                </p>

                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-border pt-2">
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-foreground/45">
                      Today's Prayer
                    </p>
                    <p className="text-xs font-medium text-foreground">
                      {u.analytics.todayLoggedCount}/{u.analytics.totalPrayers}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-foreground/45">
                      Today's Zikr
                    </p>
                    <p className="text-xs font-medium text-foreground">
                      {u.analytics.zikrToday}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-foreground/45">
                      Tilawat
                    </p>
                    <p className="text-xs font-medium text-foreground">
                      {u.analytics.tilawatToday}/{u.analytics.tilawatTarget}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-foreground/45">
                      Hifazat
                    </p>
                    <p className="text-xs font-medium text-foreground">
                      {u.analytics.hifazatToday}/{u.analytics.hifazatTarget}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop / tablet: full table */}
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-gradient-to-br from-surface to-surface-muted/30 shadow-sm sm:block">
            <table className="w-full min-w-225 text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-foreground/50">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Join Date</th>
                  <th className="px-4 py-3 font-medium">Today's Prayer</th>
                  <th className="px-4 py-3 font-medium">Today's Zikr</th>
                  <th className="px-4 py-3 font-medium">Tilawat</th>
                  <th className="px-4 py-3 font-medium">Hifazat</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-muted/50 transition-colors">
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
      )}
    </div>
  );
}
