import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/SidebarContext";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function AppShell({
  userName,
  isAdmin = false,
  children,
}: {
  userName: string;
  isAdmin?: boolean;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <Header userName={userName} />
        <div className="flex flex-1">
          <Sidebar isAdmin={isAdmin} />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
