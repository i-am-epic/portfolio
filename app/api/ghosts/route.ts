import { NextResponse } from "next/server"
import { appendCapped, readList } from "@/lib/server/store"
import { maskProfanity, sanitize } from "@/lib/server/moderate"
import { WORLD_BOUNDS } from "@/lib/world/worldData"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const KEY = "ghosts:v1"
const CAP = 24
const MAX_NAME = 16
const MIN_SAMPLES = 12
const MAX_SAMPLES = 240

/** A recorded visitor walk: [x, z, yaw] samples at a fixed interval. */
export type GhostTrail = {
  name: string
  path: [number, number, number][]
  date: number
}

export async function GET() {
  try {
    const raw = await readList(KEY, CAP)
    const ghosts = raw
      .map((s) => {
        try {
          return JSON.parse(s) as GhostTrail
        } catch {
          return null
        }
      })
      .filter(Boolean)
    return NextResponse.json({ ghosts })
  } catch (err) {
    return NextResponse.json({ ghosts: [], error: (err as Error).message }, { status: 200 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { name?: unknown; path?: unknown }
    const name = maskProfanity(sanitize(String(body.name ?? ""))).slice(0, MAX_NAME) || "Visitor"

    if (!Array.isArray(body.path)) return NextResponse.json({ error: "No path" }, { status: 400 })
    const path: [number, number, number][] = []
    for (const p of body.path.slice(0, MAX_SAMPLES)) {
      if (!Array.isArray(p) || p.length < 2) continue
      const x = Number(p[0])
      const z = Number(p[1])
      const yaw = Number(p[2] ?? 0)
      if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(yaw)) continue
      path.push([
        Math.max(WORLD_BOUNDS.x0, Math.min(WORLD_BOUNDS.x1, Math.round(x * 10) / 10)),
        Math.max(WORLD_BOUNDS.z0, Math.min(WORLD_BOUNDS.z1, Math.round(z * 10) / 10)),
        Math.round(yaw * 100) / 100,
      ])
    }
    if (path.length < MIN_SAMPLES) {
      return NextResponse.json({ error: "Walk a little longer first." }, { status: 400 })
    }

    const trail: GhostTrail = { name, path, date: Date.now() }
    await appendCapped(KEY, JSON.stringify(trail), CAP)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Failed" }, { status: 500 })
  }
}
