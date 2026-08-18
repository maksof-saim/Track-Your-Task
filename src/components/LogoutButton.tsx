"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-full border border-white/25 px-4 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
    >
      Logout
    </button>
  );
}
