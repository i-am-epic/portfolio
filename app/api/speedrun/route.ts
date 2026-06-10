import { NextResponse } from "next/server"
import { appendCapped, readList } from "@/lib/server/store"
import { maskProfanity, sanitize } from "@/lib/server/moderate"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const KEY = "speedrun:v1"
const CAP = 100
const MAX_NAME = 16
// Sanity window: a legit "open all chests" run is at least ~20s of walking.
const MIN_MS = 20_000
const MAX_MS = 60 * 60 * 1000

export type Run = {
  name: string
  ms: number
  date: number
}

export async function GET() {
  try {
    const raw = await readList(KEY, CAP)
    const runs = raw
      .map((s) => {
        try {
          return JSON.parse(s) as Run
        } catch {
          return null
        }
      })
      .filter(Boolean) as Run[]
    runs.sort((a, b) => a.ms - b.ms)
    return NextResponse.json({ runs: runs.slice(0, 10) })
  } catch (err) {
    return NextResponse.json({ runs: [], error: (err as Error).message }, { status: 200 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { name?: unknown; ms?: unknown }
    const name = maskProfanity(sanitize(String(body.name ?? "Steve"))).slice(0, MAX_NAME) || "Steve"
    const ms = Math.round(Number(body.ms) || 0)
    if (!Number.isFinite(ms) || ms < MIN_MS || ms > MAX_MS) {
      return NextResponse.json({ error: "That run time doesn't look right." }, { status: 400 })
    }

    const run: Run = { name, ms, date: Date.now() }
    await appendCapped(KEY, JSON.stringify(run), CAP)
    return NextResponse.json({ run })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Failed" }, { status: 500 })
  }
}
