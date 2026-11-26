"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f3ea] px-6 text-center text-[#23302c]">
      <p className="text-sm font-semibold uppercase tracking-widest text-[#7a5f17]">
        Something went wrong
      </p>
      <h1 className="mt-3 text-3xl font-bold text-[#084538] sm:text-4xl">
        We could not load this page
      </h1>
      <p className="mt-3 max-w-md text-base leading-7 text-[#4a5a55]">
        This is usually temporary. Please try again. If the problem continues, check your internet
        connection and come back in a few minutes.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#0b5d4b] px-8 text-base font-semibold text-white hover:bg-[#084538]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#0b5d4b] px-8 text-base font-semibold text-[#0b5d4b] hover:bg-white"
        >
          Go to home page
        </Link>
      </div>
    </div>
  );
}
