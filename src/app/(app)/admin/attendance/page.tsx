"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { todayISO } from "@/lib/prayerMeta";
import {
  getPreviousClassDay,
  getNextClassDay,
  getNearestClassDay,
  formatDisplayDate,
} from "@/lib/dateUtils";
import { useI18n } from "@/lib/i18n/client";

type AttendanceStatus = "PRESENT" | "ABSENT" | null;

type UserWithAttendance = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  attendance: AttendanceStatus;
  applicationStatus?: "SUBMITTED" | "NOT_SUBMITTED" | null;
  applicationNote?: string | null;
};

type AbsentModalState = {
  userId: string;
  userName: string;
  isOpen: boolean;
};

export default function AttendancePage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [date, setDate] = useState(getNearestClassDay(todayISO()));
  const [users, setUsers] = useState<UserWithAttendance[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStats, setSelectedStats] = useState<{
    user: { id: string; name: string };
    stats: {
      present: number;
      absent: number;
      totalMarked: number;
      attendanceRate: number;
    };
  } | null>(null);
  const [absentModal, setAbsentModal] = useState<AbsentModalState>({
    userId: "",
    userName: "",
    isOpen: false,
  });
  const [applicationStatus, setApplicationStatus] = useState<"SUBMITTED" | "NOT_SUBMITTED" | null>(null);
  const [applicationNote, setApplicationNote] = useState("");

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

  function openAbsentModal(userId: string, userName: string) {
    const user = users?.find((u) => u.id === userId);
    setApplicationStatus(user?.applicationStatus || null);
    setApplicationNote(user?.applicationNote || "");
    setAbsentModal({ userId, userName, isOpen: true });
  }

  function closeAbsentModal() {
    setAbsentModal({ userId: "", userName: "", isOpen: false });
    setApplicationStatus(null);
    setApplicationNote("");
  }

  function setAttendanceStatus(userId: string, value: string) {
    const status: AttendanceStatus = value === "" ? null : (value as "PRESENT" | "ABSENT");
    setUsers((prev) => {
      if (!prev) return prev;
      return prev.map((user) => {
        if (user.id === userId) {
          return { ...user, attendance: status };
        }
        return user;
      });
    });
  }

  function saveAbsentDetails() {
    setUsers((prev) => {
      if (!prev) return prev;
      return prev.map((user) => {
        if (user.id === absentModal.userId) {
          return {
            ...user,
            attendance: "ABSENT",
            applicationStatus,
            applicationNote,
          };
        }
        return user;
      });
    });
    closeAbsentModal();
  }

  async function handleSave() {
    if (!users) return;

    const attendance = users
      .filter((u) => u.attendance !== null)
      .map((u) => ({
        userId: u.id,
        status: u.attendance,
        applicationStatus: u.applicationStatus,
        applicationNote: u.applicationNote,
      }));

    if (attendance.length === 0) {
      toast.error(t.admin.toast.noAttendance, {
        description: t.admin.toast.noAttendanceHint,
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
        toast.success(t.admin.toast.saved, {
          description: t.admin.toast.savedHint,
        });

        // Refresh attendance data
        await fetchAttendance();

        // If stats modal is open, refresh it
        if (selectedStats) {
          await fetchUserStats(selectedStats.user.id);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(t.admin.toast.saveFail, {
          description: data.error || t.admin.toast.tryAgain,
        });
      }
    } catch {
      toast.error(t.admin.toast.saveFail, {
        description: t.admin.toast.tryAgain,
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
        toast.error(t.admin.toast.loadFail, {
          description: data.error || t.admin.toast.tryAgain,
        });
      }
    } catch {
      toast.error(t.admin.toast.loadFail, {
        description: t.admin.toast.tryAgain,
      });
    }
    setLoading(false);
  }

  async function fetchUserStats(userId: string) {
    try {
      const res = await fetch(`/api/admin/attendance/stats?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStats({
          user: {
            id: data.user.id,
            name: data.user.name,
          },
          stats: data.stats,
        });
      } else {
        toast.error(t.admin.toast.statsFail, {
          description: t.admin.toast.tryAgain,
        });
      }
    } catch {
      toast.error(t.admin.toast.statsFail, {
        description: t.admin.toast.tryAgain,
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
      <div className="mb-4 flex gap-2 overflow-x-auto border-b border-border">
        <a
          href="/admin"
          className="shrink-0 border-b-2 border-transparent px-3 py-2 text-xs font-medium text-foreground/60 transition-colors hover:border-border hover:text-foreground sm:text-sm"
        >
          {t.admin.users}
        </a>
        <a
          href="/admin/attendance"
          className="shrink-0 border-b-2 border-primary-500 px-3 py-2 text-xs font-medium text-foreground sm:text-sm"
        >
          {t.admin.attendance}
        </a>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-500 sm:text-xs">
            {t.admin.panel}
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {t.admin.attendance}
          </h1>
          <p className="mt-1 text-xs text-foreground/60 sm:text-sm">{t.admin.attendanceHint}</p>
        </div>

        <div className="rounded-xl border border-border bg-surface-muted/50 p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 sm:h-10 sm:w-10">
                <svg className="h-4 w-4 text-primary-500 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-foreground/60 sm:text-xs">
                  {t.admin.selectedDate}
                </p>
                <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                  {formatDisplayDate(date, locale)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={goToPreviousDay}
                className="flex-1 shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs transition-colors hover:border-primary-300 sm:text-sm"
              >
                {t.common.previous}
              </button>
              <button
                onClick={goToToday}
                className="flex-1 shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs transition-colors hover:border-primary-300 sm:text-sm"
              >
                {t.common.today}
              </button>
              <button
                onClick={goToNextDay}
                className="flex-1 shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs transition-colors hover:border-primary-300 sm:text-sm"
              >
                {t.common.next}
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="attendance-date"
                className="shrink-0 text-[10px] font-medium text-foreground/60 sm:text-xs"
              >
                {t.admin.selectDate}
              </label>
              <input
                id="attendance-date"
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-3">
        <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
          <p className="text-[10px] text-foreground/60 sm:text-xs">{t.admin.totalUsers}</p>
          <p className="text-xl font-bold text-foreground sm:text-2xl">{users?.length || 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
          <p className="text-[10px] text-foreground/60 sm:text-xs">{t.admin.present}</p>
          <p className="text-xl font-bold text-green-600 sm:text-2xl">{presentCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
          <p className="text-[10px] text-foreground/60 sm:text-xs">{t.admin.absent}</p>
          <p className="text-xl font-bold text-red-600 sm:text-2xl">{absentCount}</p>
        </div>
      </div>

      {/* User List */}
      <div className={`space-y-2 sm:space-y-3 ${loading ? "opacity-50" : ""}`}>
        {users && users.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center sm:p-12">
            <div className="mb-4 text-3xl sm:text-4xl">📅</div>
            <p className="text-base font-medium text-foreground sm:text-lg">{t.admin.noUsersFound}</p>
            <p className="mt-2 text-xs text-foreground/50 sm:text-sm">{t.admin.noUsersJoined}</p>
          </div>
        )}

        {users && users.length > 0 && (
          <>
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-xs font-semibold text-primary-600 sm:h-10 sm:w-10 sm:text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground sm:text-base">{user.name}</p>
                    <p className="truncate text-[10px] text-foreground/50 sm:text-xs">{user.email}</p>
                  </div>
                </div>

                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <select
                    value={user.attendance || ""}
                    onChange={(e) => setAttendanceStatus(user.id, e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 sm:flex-none sm:text-sm"
                  >
                    <option value="">{t.admin.selectStatus}</option>
                    <option value="PRESENT">{t.admin.present}</option>
                    <option value="ABSENT">{t.admin.absent}</option>
                  </select>
                  {user.attendance === "ABSENT" && (
                    <button
                      onClick={() => openAbsentModal(user.id, user.name)}
                      className="shrink-0 rounded-lg border border-border bg-surface-muted px-2 py-2 text-xs transition-colors hover:border-primary-300 sm:px-3 sm:py-2"
                      title={t.admin.addApplicationDetails}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => fetchUserStats(user.id)}
                    className="shrink-0 rounded-lg border border-border bg-surface-muted px-2 py-2 text-xs transition-colors hover:border-primary-300 sm:px-3 sm:py-2"
                    title={t.admin.viewStatistics}
                  >
                    {t.admin.stats}
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-4 sm:mt-6">
              <button
                onClick={handleSave}
                disabled={saving || loading || markedCount === 0}
                className="flex w-full items-center justify-center rounded-xl bg-primary-500 px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60 sm:px-5 sm:py-3 sm:text-sm"
              >
                {saving ? (
                  <>
                    <div className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t.admin.saving}
                  </>
                ) : (
                  t.admin.saveAttendance(markedCount)
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
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                {selectedStats.user.name} - {t.admin.statistics}
              </h2>
              <button
                onClick={() => setSelectedStats(null)}
                className="rounded-lg p-2 transition-colors hover:bg-surface-muted"
              >
                <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between rounded-lg border border-border bg-surface-muted p-3 sm:p-4">
                <span className="text-xs text-foreground/60 sm:text-sm">{t.admin.totalPresent}</span>
                <span className="text-sm font-semibold text-green-600 sm:text-base">
                  {selectedStats.stats.present}
                </span>
              </div>
              <div className="flex justify-between rounded-lg border border-border bg-surface-muted p-3 sm:p-4">
                <span className="text-xs text-foreground/60 sm:text-sm">{t.admin.totalAbsent}</span>
                <span className="text-sm font-semibold text-red-600 sm:text-base">
                  {selectedStats.stats.absent}
                </span>
              </div>
              <div className="flex justify-between rounded-lg border border-border bg-surface-muted p-3 sm:p-4">
                <span className="text-xs text-foreground/60 sm:text-sm">{t.admin.totalMarked}</span>
                <span className="text-sm font-semibold text-foreground sm:text-base">
                  {selectedStats.stats.totalMarked}
                </span>
              </div>
              <div className="flex justify-between rounded-lg border border-border bg-surface-muted p-3 sm:p-4">
                <span className="text-xs text-foreground/60 sm:text-sm">{t.admin.attendanceRate}</span>
                <span className="text-sm font-semibold text-primary-600 sm:text-base">
                  {selectedStats.stats.attendanceRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Absent Details Modal */}
      {absentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                {absentModal.userName} - {t.admin.absentDetails}
              </h2>
              <button
                onClick={closeAbsentModal}
                className="rounded-lg p-2 transition-colors hover:bg-surface-muted"
              >
                <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-foreground">
                  {t.admin.applicationStatus}
                </label>
                <select
                  value={applicationStatus || ""}
                  onChange={(e) =>
                    setApplicationStatus(e.target.value as "SUBMITTED" | "NOT_SUBMITTED" | null)
                  }
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">{t.admin.selectStatus}</option>
                  <option value="SUBMITTED">{t.admin.submitted}</option>
                  <option value="NOT_SUBMITTED">{t.admin.notSubmitted}</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-foreground">
                  {t.admin.noteOptional}
                </label>
                <textarea
                  value={applicationNote}
                  onChange={(e) => setApplicationNote(e.target.value)}
                  placeholder={t.admin.notePlaceholder}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <button
                onClick={saveAbsentDetails}
                className="w-full rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                {t.admin.saveDetails}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
