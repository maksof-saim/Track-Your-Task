import { auth } from "@/lib/auth";
import { SidebarProvider } from "@/components/SidebarContext";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import { localeDir } from "@/lib/i18n/config";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, locale] = await Promise.all([auth(), getLocale()]);
  const userName = session?.user?.name ?? "Dost";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <LocaleProvider locale={locale}>
      <SidebarProvider>
        <div
          lang={locale}
          dir={localeDir(locale)}
          data-locale={locale}
          className="flex min-h-screen flex-1 flex-col pt-16 sm:pt-0"
        >
          <Header userName={userName} />
          <div className="flex min-w-0 flex-1">
            <Sidebar isAdmin={isAdmin} />
            <main className="min-w-0 flex-1 bg-background px-4 py-6 sm:px-8 sm:py-8">
              {children}
            </main>
          </div>
          <Footer />
          <Toaster position="top-right" richColors closeButton />
        </div>
      </SidebarProvider>
    </LocaleProvider>
  );
}
