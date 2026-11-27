import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminUsersTable from "@/components/AdminUsersTable";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const t = getDictionary(await getLocale());

  return (
    <div className="mx-auto w-full max-w-7xl px-2 sm:px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t.admin.panel}</h1>
        <p className="mt-1 text-xs text-foreground/70 sm:text-sm">{t.admin.manageUsersHint}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto border-b border-border sm:mb-6">
        <a
          href="/admin"
          className="shrink-0 border-b-2 border-primary-500 px-3 py-2 text-xs font-medium text-foreground sm:text-sm"
        >
          {t.admin.users}
        </a>
        <a
          href="/admin/attendance"
          className="shrink-0 border-b-2 border-transparent px-3 py-2 text-xs font-medium text-foreground/60 transition-colors hover:border-border hover:text-foreground sm:text-sm"
        >
          {t.admin.attendance}
        </a>
      </div>

      <AdminUsersTable />
    </div>
  );
}
