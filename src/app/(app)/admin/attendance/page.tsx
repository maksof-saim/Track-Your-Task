"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { todayISO } from "@/lib/prayerMeta";
import { getPreviousClassDay, getNextClassDay, getNearestClassDay, formatDisplayDate, isClassDay } from "@/lib/dateUtils";

type AttendanceStatus = "PRESENT" | "ABSENT" | null;

type UserWithAttendance = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  attendance: AttendanceStatus;
};

export default function AttendancePage() {
  const router = useRouter();
  const [date, setDate] = useState(getNearestClassDay(todayISO()));
  const [users, setUsers] = useState<UserWithAttendance[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStats, setSelectedStats] = useState<{ user: { name: string }; stats: any } | null>(null);

  function handleDateChange(newDate: string) {
    setDate(newDate);
  }

  function goToPreviousDay() {
    setDate(getPreviousClassDay(date));
  }

  function goToNextDay() {
    setDate(getNextClassDay(date));
  }

  function goToToday() {
    setDate(getNearestClassDay(todayISO()));
  }

  function toggleAttendance(userId: string) {
    setUsers((prev) => {
      if (!prev) return prev;
      return prev.map((user) => {
        if (user.id === userId) {
          const current = user.attendance;
          let newStatus: AttendanceStatus;
          if (current === null) newStatus = "PRESENT";
          else if (current === "PRESENT") newStatus = "ABSENT";
          else newStatus = null;
          return { ...user, attendance: newStatus };
        }
        return user;
      });
    });
  }

  async function handleSave() {
    if (!users) return;

    const attendance = users
      .filter((u) => u.attendance !== null)
      .map((u) => ({ userId: u.id, status: u.attendance }));

    if (attendance.length === 0) {
      toast.error("No attendance marked", {
        description: "Please mark at least one user as present or absent.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, attendance }),
      });

      if (res.ok) {
        toast.success("Attendance saved successfully!", {
          description: "Attendance records have been updated.",
        });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error("Failed to save attendance", {
          description: data.error || "Please try again.",
        });
      }
    } catch (error) {
      toast.error("Failed to save attendance", {
        description: "Please try again.",
      });
    }
    setSaving(false);
  }

  async function fetchAttendance() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error("Failed to load attendance", {
          description: data.error || "Please try again.",
        });
      }
    } catch (error) {
      toast.error("Failed to load attendance", {
        description: "Please try again.",
      });
    }
    setLoading(false);
  }

  async function fetchUserStats(userId: string) {
    try {
      const res = await fetch(`/api/admin/attendance/stats?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStats(data);
      } else {
        toast.error("Failed to load user statistics", {
          description: "Please try again.",
        });
      }
    } catch (error) {
      toast.error("Failed to load user statistics", {
        description: "Please try again.",
      });
    }
  }

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const markedCount = users?.filter((u) => u.attendance !== null).length || 0;
  const presentCount = users?.filter((u) => u.attendance === "PRESENT").length || 0;
  const absentCount = users?.filter((u) => u.attendance === "ABSENT").length || 0;

  return (
    <div className="mx-auto max-w-4xl px-2 sm:px-4">
      {/* Navigation Tabs */}
      <div className="mb-4 flex gap-2 border-b border-border overflow-x-auto">
        <a
          href="/admin"
          className="shrink-0 border-b-2 border-transparent px-3 py-2 text-xs sm:text-sm font-medium text-foreground/60 hover:text-foreground hover:border-border transition-colors"
        >
          User Management
        </a>
        <a
          href="/admin/attendance"
          className="shrink-0 border-b-2 border-primary-500 px-3 py-2 text-xs sm:text-sm font-medium text-foreground"
        >
          Attendance
        </a>
      </div>

      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
        <div>
          <p className="mb-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">
            Admin Panel
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Attendance</h1>
          <p className="mt-1 text-xs sm:text-sm text-foreground/60">Mark attendance for users (Saturday & Sunday only)</p>
        </div>

        <div className="rounded-xl border border-border bg-surface-muted/50 p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary-500/10 shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-foreground/60">Selected Date</p>
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{formatDisplayDate(date)}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={goToPreviousDay}
                className="flex-1 shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs sm:text-sm hover:border-primary-300 transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={goToToday}
                className="flex-1 shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs sm:text-sm hover:border-primary-300 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNextDay}
                className="flex-1 shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs sm:text-sm hover:border-primary-300 transition-colors"
              >
                Next →
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label htmlFor="attendance-date" className="text-[10px] sm:text-xs font-medium text-foreground/60 shrink-0">
                Select date:
              </label>
              <input
                id="attendance-date"
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs sm:text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-foreground/60">Total Users</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{users?.length || 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-foreground/60">Present</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{presentCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-foreground/60">Absent</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600">{absentCount}</p>
        </div>
      </div>

      {/* User List */}
      <div className={`space-y-2 sm:space-y-3 ${loading ? "opacity-50" : ""}`}>
        {users && users.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-12 text-center">
            <div className="mb-4 text-3xl sm:text-4xl">📅</div>
            <p className="text-base sm:text-lg font-medium text-foreground">No users found</p>
            <p className="mt-2 text-xs sm:text-sm text-foreground/50">
              No users have joined by this date
            </p>
          </div>
        )}

        {users && users.length > 0 && (
          <>
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 sm:p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-600 font-semibold text-xs sm:text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-[10px] sm:text-xs text-foreground/50 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => toggleAttendance(user.id)}
                    className={`flex-1 sm:flex-none rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${user.attendance === "PRESENT"
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : user.attendance === "ABSENT"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "border border-border bg-surface-muted text-foreground hover:border-primary-300"
                      }`}
                  >
                    {user.attendance === "PRESENT"
                      ? "Present"
                      : user.attendance === "ABSENT"
                        ? "Absent"
                        : "Not Marked"}
                  </button>
                  <button
                    onClick={() => fetchUserStats(user.id)}
                    className="shrink-0 rounded-lg border border-border bg-surface-muted px-2 py-2 text-xs sm:px-3 sm:py-2 hover:border-primary-300 transition-colors"
                    title="View Statistics"
                  >
                    Stats
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-4 sm:mt-6">
              <button
                onClick={handleSave}
                disabled={saving || loading || markedCount === 0}
                className="flex items-center justify-center w-full rounded-xl bg-primary-500 px-4 py-3 text-xs sm:text-sm sm:px-5 sm:py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  `Save Attendance (${markedCount} marked)`
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Stats Modal */}
      {selectedStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                {selectedStats.user.name} - Statistics
              </h2>
              <button
                onClick={() => setSelectedStats(null)}
                className="rounded-lg p-2 hover:bg-surface-muted transition-colors"
              >
                <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between rounded-lg border border-border bg-surface-muted p-3 sm:p-4">
                <span className="text-xs sm:text-sm text-foreground/60">Total Present</span>
                <span className="font-semibold text-green-600 text-sm sm:text-base">{selectedStats.stats.present}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-border bg-surface-muted p-3 sm:p-4">
                <span className="text-xs sm:text-sm text-foreground/60">Total Absent</span>
                <span className="font-semibold text-red-600 text-sm sm:text-base">{selectedStats.stats.absent}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-border bg-surface-muted p-3 sm:p-4">
                <span className="text-xs sm:text-sm text-foreground/60">Total Marked</span>
                <span className="font-semibold text-foreground text-sm sm:text-base">{selectedStats.stats.totalMarked}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-border bg-surface-muted p-3 sm:p-4">
                <span className="text-xs sm:text-sm text-foreground/60">Attendance Rate</span>
                <span className="font-semibold text-primary-600 text-sm sm:text-base">{selectedStats.stats.attendanceRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
