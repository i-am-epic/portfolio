import { ImageResponse } from "next/og"
import { readFile } from "fs/promises"
import path from "path"
import { PROFILE } from "@/lib/world/worldData"

export const runtime = "nodejs"
export const alt = "Nikhil A V — Data Engineer & AI Builder. Explorable 3D voxel portfolio."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Voxel ground strip along the bottom edge, echoing the 3D world.
const BLOCKS = ["#3f8f3a", "#3f8f3a", "#56a046", "#3f8f3a", "#7a5a38", "#3f8f3a", "#56a046", "#3f8f3a", "#3f8f3a", "#7a5a38", "#56a046", "#3f8f3a"]

export default async function OgImage() {
  let fonts: { name: string; data: Buffer; weight: 400 | 700 }[] = []
  try {
    const data = await readFile(path.join(process.cwd(), "public", "fonts", "Monocraft-Bold.ttf"))
    fonts = [{ name: "Monocraft", data, weight: 700 }]
  } catch {
    // Font missing in the trace — fall back to the default font.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: "radial-gradient(circle at 50% 18%, #1b2a4a 0%, #0b0d12 62%)",
          fontFamily: fonts.length ? "Monocraft" : "monospace",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 14, color: "#77a6ff" }}>
          {PROFILE.role.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#ff7a48",
            textShadow: "6px 6px 0 #000",
            marginTop: 18,
          }}
        >
          {PROFILE.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#cbd5e1",
            marginTop: 26,
            maxWidth: 900,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          {PROFILE.tagline}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#a7f3d0",
            marginTop: 34,
            padding: "12px 28px",
            background: "rgba(10,11,14,0.7)",
            border: "3px solid #15161b",
          }}
        >
          ▶ Walk through the 3D portfolio world — nikhilav.dev
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, display: "flex" }}>
          {BLOCKS.map((c, i) => (
            <div key={i} style={{ width: 100, height: 46, background: c, borderTop: "6px solid #2c6b2a" }} />
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  )
}
