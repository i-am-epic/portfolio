import { NextResponse } from "next/server"
import { appendCapped, readList } from "@/lib/server/store"
import { maskProfanity, sanitize } from "@/lib/server/moderate"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const KEY = "leaderboard:v1"
const CAP = 100
const MAX_NAME = 16

export type Card = {
  name: string
  amount: number
  symbol: string
  date: number
}

export async function GET() {
  try {
    const raw = await readList(KEY, CAP)
    const cards = raw
      .map((s) => {
        try {
          return JSON.parse(s) as Card
        } catch {
          return null
        }
      })
      .filter(Boolean) as Card[]
    cards.sort((a, b) => b.amount - a.amount)
    return NextResponse.json({ cards: cards.slice(0, 25) })
  } catch (err) {
    return NextResponse.json({ cards: [], error: (err as Error).message }, { status: 200 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { name?: unknown; amount?: unknown; symbol?: unknown }
    const name = maskProfanity(sanitize(String(body.name ?? "Steve"))).slice(0, MAX_NAME) || "Steve"
    const amount = Math.max(0, Math.min(1_000_000, Math.round(Number(body.amount) || 0)))
    const symbol = String(body.symbol ?? "🎰").slice(0, 4)
    if (amount <= 0) return NextResponse.json({ error: "No win to record" }, { status: 400 })

    const card: Card = { name, amount, symbol, date: Date.now() }
    await appendCapped(KEY, JSON.stringify(card), CAP)
    return NextResponse.json({ card })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Failed" }, { status: 500 })
  }
}
