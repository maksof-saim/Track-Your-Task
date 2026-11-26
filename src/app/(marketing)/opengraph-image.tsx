import { ImageResponse } from "next/og";

export const alt = "Track Your Amaal – Salah, Dhikr and Quran habit tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0b5d4b",
          color: "#ffffff",
        }}
      >
        <div
          style={{ display: "flex", width: 120, height: 8, background: "#b8963e", marginBottom: 40 }}
        />
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700 }}>Track Your Amaal</div>
        <div style={{ display: "flex", fontSize: 40, marginTop: 24, color: "#e3cf9a" }}>
          Salah, Dhikr and Quran habit tracker
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 48, opacity: 0.85 }}>
          Track your daily prayers, dhikr, tilawat and hifazat
        </div>
      </div>
    ),
    { ...size },
  );
}
