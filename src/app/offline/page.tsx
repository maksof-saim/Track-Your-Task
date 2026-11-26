import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You are offline — Track Your Amaal",
  description: "This page appears when your device has no internet connection.",
  robots: { index: false, follow: false },
};

// Styles are inline on purpose: this page is served by the service worker while
// the device is offline, so no external stylesheet, font or image is available.
export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "24px",
        background: "#faf8f2",
        color: "#16241f",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "#0f6b48",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "26px",
        }}
        aria-hidden="true"
      >
        !
      </div>

      <h1 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
        You are offline
      </h1>
      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#4a5a53",
          maxWidth: "320px",
          margin: 0,
        }}
      >
        No internet connection was found. Your saved records are safe — reconnect
        and reload the page to continue tracking your amaal.
      </p>

      <a
        href="/dashboard"
        style={{
          marginTop: "8px",
          display: "inline-block",
          padding: "10px 20px",
          borderRadius: "10px",
          background: "#0f6b48",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Try again
      </a>
    </main>
  );
}
