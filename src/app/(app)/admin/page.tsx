import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminUsersTable from "@/components/AdminUsersTable";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-2 sm:px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Admin Panel</h1>
        <p className="mt-1 text-xs text-foreground/70 sm:text-sm">
          Manage users and track attendance
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border">
        <a
          href="/admin"
          className="border-b-2 border-primary-500 px-4 py-2 text-sm font-medium text-foreground"
        >
          User Management
        </a>
        <a
          href="/admin/attendance"
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground hover:border-border transition-colors"
        >
          Attendance
        </a>
      </div>

      <AdminUsersTable />
    </div>
  );
}
