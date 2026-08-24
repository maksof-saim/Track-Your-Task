"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SidebarContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value: SidebarContextValue = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

const noopSidebarValue: SidebarContextValue = {
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
};

/**
 * Returns the sidebar state when inside a <SidebarProvider>.
 * If used on a page that isn't wrapped in AppShell/SidebarProvider
 * (e.g. a login or public page with no sidebar), it safely falls
 * back to a no-op value instead of crashing the page with a 500.
 */
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "useSidebar() called outside a <SidebarProvider> — falling back to a disabled sidebar. Wrap this page in <AppShell> if it should have a sidebar."
      );
    }
    return noopSidebarValue;
  }
  return ctx;
}
