"use client"

// Client helpers for the scroll feedback wall. Talks to /api/scrolls (shared,
// Upstash-backed) and falls back to localStorage if the network/API is unavailable
// so the feature still works offline / in preview.

export type Scroll = {
  id: string
  message: string
  name: string | null
  date: number
}

const LOCAL_KEY = "scrolls:local"

function readLocal(): Scroll[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]") as Scroll[]
  } catch {
    return []
  }
}

function saveLocal(scroll: Scroll) {
  try {
    const all = [scroll, ...readLocal()].slice(0, 150)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all))
  } catch {}
}

export async function fetchScrolls(): Promise<Scroll[]> {
  try {
    const res = await fetch("/api/scrolls", { cache: "no-store" })
    if (!res.ok) throw new Error("bad status")
    const data = (await res.json()) as { scrolls?: Scroll[] }
    if (Array.isArray(data.scrolls)) return data.scrolls
    throw new Error("no scrolls")
  } catch {
    return readLocal()
  }
}

export async function throwScroll(message: string, name: string): Promise<Scroll> {
  const trimmed = message.trim()
  const who = name.trim()
  try {
    const res = await fetch("/api/scrolls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed, name: who }),
    })
    const data = (await res.json()) as { scroll?: Scroll; error?: string }
    if (res.ok && data.scroll) return data.scroll
    throw new Error(data.error || "failed")
  } catch {
    // Offline fallback: keep it locally so the thrower still sees their bottle.
    const scroll: Scroll = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      message: trimmed,
      name: who || null,
      date: Date.now(),
    }
    saveLocal(scroll)
    return scroll
  }
}
