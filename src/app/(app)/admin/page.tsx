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
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">User Management</h1>
        <p className="mt-1 text-xs text-foreground/70 sm:text-sm">
          View and manage all registered users and their activity records
        </p>
      </div>
      <AdminUsersTable />
    </div>
  );
}
