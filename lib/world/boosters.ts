import type { Stats } from "./leaderboard"

export type Booster = {
  id: "lucky" | "wild" | "scatter" | "diamond"
  icon: string
  name: string
  desc: string
  req: string
  unlocked: (s: Stats) => boolean
}

// Permanent perks that auto-activate once their milestone is reached.
export const BOOSTERS: Booster[] = [
  { id: "lucky", icon: "🍀", name: "Lucky Charm", desc: "+10% on every win", req: "Spin 25 times", unlocked: (s) => s.spins >= 25 },
  { id: "wild", icon: "⭐", name: "Wild Surge", desc: "Wilds appear more often", req: "Land 1 jackpot", unlocked: (s) => s.jackpots >= 1 },
  { id: "scatter", icon: "🎟", name: "Scatter Master", desc: "+2 free spins on scatter", req: "Spin 75 times", unlocked: (s) => s.spins >= 75 },
  { id: "diamond", icon: "💎", name: "Diamond Hands", desc: "Diamond line wins ×1.5", req: "Land 3 jackpots", unlocked: (s) => s.jackpots >= 3 },
]

export type ActiveBoosts = Record<Booster["id"], boolean>

export function activeBoosts(s: Stats): ActiveBoosts {
  return {
    lucky: s.spins >= 25,
    wild: s.jackpots >= 1,
    scatter: s.spins >= 75,
    diamond: s.jackpots >= 3,
  }
}
