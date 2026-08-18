import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminUsersTable from "@/components/AdminUsersTable";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Admin — Sab Users ka Record</h1>
        <p className="text-sm text-foreground/60">
          Is project mein register hone wale har user ki ibadat ka khulasa
        </p>
      </div>
      <AdminUsersTable />
    </div>
  );
}
