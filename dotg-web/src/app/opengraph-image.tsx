import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#111827",
          color: "#f9fafb",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ color: "#93c5fd", fontSize: 42, fontWeight: 700 }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1 }}>
            Game Creation Club
          </div>
          <div style={{ color: "#d1d5db", fontSize: 34, lineHeight: 1.35 }}>
            Projects, notices, recruitment, and club activity.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
