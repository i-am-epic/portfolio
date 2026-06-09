/**
 * Local (per-browser) persistence for the Lucky Blocks slot machine:
 * jackpot/big-win "name cards", all-time high score, and the current coin purse.
 * Uses localStorage so it works with zero backend. Can later be swapped for a
 * shared API-backed leaderboard without changing callers.
 */

export type NameCard = {
  name: string
  amount: number
  symbol: string
  date: number // epoch ms
}

const CARDS_KEY = "lucky-blocks:cards"
const HIGH_KEY = "lucky-blocks:high"
const COINS_KEY = "lucky-blocks:coins"
const MINE_KEY = "lucky-blocks:mineAt"
const STATS_KEY = "lucky-blocks:stats"
const MAX_CARDS = 12

export const START_COINS = 1000

// Time-gated "mining": come back every hour for a big payout.
export const MINE_AMOUNT = 1000
export const MINE_COOLDOWN_MS = 60 * 60 * 1000

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function getCards(): NameCard[] {
  return read<NameCard[]>(CARDS_KEY, []).sort((a, b) => b.amount - a.amount)
}

export function addCard(card: NameCard): NameCard[] {
  const cards = [...getCards(), card].sort((a, b) => b.amount - a.amount).slice(0, MAX_CARDS)
  write(CARDS_KEY, cards)
  return cards
}

export function getHighScore(): number {
  return read<number>(HIGH_KEY, START_COINS)
}

export function setHighScore(n: number) {
  if (n > getHighScore()) write(HIGH_KEY, n)
}

export function getCoins(): number {
  return read<number>(COINS_KEY, START_COINS)
}

export function setCoins(n: number) {
  write(COINS_KEY, Math.max(0, Math.round(n)))
}

// --- Time-gated mining ---

export function mineStatus(): { ready: boolean; msLeft: number } {
  const last = read<number>(MINE_KEY, 0)
  const elapsed = Date.now() - last
  if (last === 0 || elapsed >= MINE_COOLDOWN_MS) return { ready: true, msLeft: 0 }
  return { ready: false, msLeft: MINE_COOLDOWN_MS - elapsed }
}

export function claimMine(): boolean {
  if (!mineStatus().ready) return false
  write(MINE_KEY, Date.now())
  return true
}

// --- Lifetime stats (drive booster unlocks) ---

export type Stats = { spins: number; jackpots: number }

export function getStats(): Stats {
  return read<Stats>(STATS_KEY, { spins: 0, jackpots: 0 })
}

export function bumpStats(p: Partial<Stats>) {
  const s = getStats()
  write(STATS_KEY, { spins: s.spins + (p.spins || 0), jackpots: s.jackpots + (p.jackpots || 0) })
}

// --- Shared (cross-visitor) leaderboard via /api/leaderboard, with local fallback ---

export async function fetchCards(): Promise<NameCard[]> {
  try {
    const res = await fetch("/api/leaderboard", { cache: "no-store" })
    if (!res.ok) throw new Error("bad status")
    const data = (await res.json()) as { cards?: NameCard[] }
    if (Array.isArray(data.cards) && data.cards.length >= 0) {
      // merge any local-only cards (e.g. created offline) so nothing is lost
      const merged = [...data.cards, ...getCards()]
      const seen = new Set<string>()
      return merged
        .filter((c) => {
          const k = `${c.name}|${c.amount}|${c.date}`
          if (seen.has(k)) return false
          seen.add(k)
          return true
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 25)
    }
    throw new Error("no cards")
  } catch {
    return getCards()
  }
}

export async function postCard(card: NameCard): Promise<void> {
  addCard(card) // local mirror so the player always sees their own card
  try {
    await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: card.name, amount: card.amount, symbol: card.symbol }),
    })
  } catch {}
}
