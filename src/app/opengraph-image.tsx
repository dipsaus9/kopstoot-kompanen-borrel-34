import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import wrapped from "@/data/wrapped.json";

export const runtime = "nodejs";
export const alt = "Borrel 34 Wrapped — Kopstoot Kompanen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public", "borrel-logo.jpg"));
  const logoSrc = `data:image/jpeg;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0a0510",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* glow */}
        <div
          style={{
            position: "absolute",
            top: -280,
            left: 260,
            width: 900,
            height: 900,
            borderRadius: 900,
            background: "radial-gradient(circle, #2a0a4a 0%, rgba(10,5,16,0) 70%)",
            display: "flex",
          }}
        />
        {/* content */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "70px 80px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
            <div
              style={{
                display: "flex",
                whiteSpace: "nowrap",
                fontSize: 25,
                letterSpacing: 6,
                color: "#c6ff3d",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Kopstoot Kompanen · Editie {wrapped.meta.edition}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 128,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1,
                marginTop: 18,
                letterSpacing: -3,
              }}
            >
              Borrel 34
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 128,
                fontWeight: 800,
                color: "#35e0ff",
                lineHeight: 1,
                letterSpacing: -3,
              }}
            >
              Wrapped
            </div>
            <div style={{ display: "flex", fontSize: 32, color: "#ffffffcc", marginTop: 34 }}>
              {wrapped.meta.respondents} lange mensen · 17 juli · Griftpark, Utrecht
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            width={320}
            height={320}
            style={{
              borderRadius: 40,
              border: "4px solid rgba(255,255,255,0.15)",
            }}
            alt=""
          />
        </div>

        {/* bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 10,
            display: "flex",
            background: "linear-gradient(90deg,#c6ff3d,#ff3d81,#35e0ff)",
          }}
        />
      </div>
    ),
    size,
  );
}
