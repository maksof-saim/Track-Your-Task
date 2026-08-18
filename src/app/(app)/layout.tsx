import { auth } from "@/lib/auth";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userName = session?.user?.name ?? "Dost";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header userName={userName} />
      <div className="flex min-w-0 flex-1">
        <Sidebar isAdmin={isAdmin} />
        <main className="min-w-0 flex-1 bg-background px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
