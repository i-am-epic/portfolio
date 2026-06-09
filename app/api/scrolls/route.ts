import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { appendCapped, readList } from "@/lib/server/store"
import { looksLikePromptInjection, looksMalicious, maskProfanity, niceTryScroll, sanitize } from "@/lib/server/moderate"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const KEY = "scrolls:v1"
const CAP = 150
const MAX_MESSAGE = 280
const MAX_NAME = 24

export type Scroll = {
  id: string
  message: string
  name: string | null
  date: number
}

export async function GET() {
  try {
    const raw = await readList(KEY, CAP)
    const scrolls = raw
      .map((s) => {
        try {
          return JSON.parse(s) as Scroll
        } catch {
          return null
        }
      })
      .filter(Boolean)
    return NextResponse.json({ scrolls })
  } catch (err) {
    return NextResponse.json({ scrolls: [], error: (err as Error).message }, { status: 200 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { message?: unknown; name?: unknown }
    const rawMessage = String(body.message ?? "")
    let message = sanitize(rawMessage).slice(0, MAX_MESSAGE)
    let name = sanitize(String(body.name ?? "")).slice(0, MAX_NAME)

    if (!message) return NextResponse.json({ error: "A scroll needs some words." }, { status: 400 })

    // Injection attempts get neutralized into a playful "nice try" bottle.
    if (looksMalicious(rawMessage) || looksLikePromptInjection(rawMessage)) {
      message = niceTryScroll()
      name = "caught red-handed"
    } else {
      message = maskProfanity(message)
      name = name ? maskProfanity(name) : ""
    }

    const scroll: Scroll = {
      id: randomUUID(),
      message,
      name: name || null,
      date: Date.now(),
    }

    await appendCapped(KEY, JSON.stringify(scroll), CAP)
    return NextResponse.json({ scroll })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Failed to throw scroll" }, { status: 500 })
  }
}
