/**
 * Advancement / quest system for the 3D world. Unlocks persist per-browser in
 * localStorage; the "Chest Run" speedrun (open every project chest) reports to
 * the shared /api/speedrun leaderboard.
 */

import { create } from "zustand"
import { PROJECT_CHESTS, type Interactable } from "./worldData"

export type AchievementDef = {
  id: string
  icon: string
  title: string
  desc: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "spawn", icon: "🌱", title: "Taking Inventory", desc: "Enter the world" },
  { id: "first-chest", icon: "📦", title: "Getting an Upgrade", desc: "Open your first project chest" },
  { id: "all-chests", icon: "💎", title: "Cover Me With Projects", desc: `Open all ${PROJECT_CHESTS.length} project chests` },
  { id: "navi", icon: "🧑‍🌾", title: "Local Brewery", desc: "Talk to NAVI, the AI villager" },
  { id: "dj", icon: "🎵", title: "Sound of Music", desc: "Fire up the jukebox" },
  { id: "gambler", icon: "🎰", title: "Diamonds to You!", desc: "Play the Lucky Blocks slots" },
  { id: "scholar", icon: "📚", title: "Librarian", desc: "Read all three plaza boards" },
  { id: "homeowner", icon: "🏠", title: "Home Sweet Home", desc: "Step inside the cottage" },
  { id: "explorer", icon: "🧭", title: "Edge of the World", desc: "Walk to the island's border" },
  { id: "portal-walker", icon: "🌀", title: "We Need to Go Deeper", desc: "Reach the contact portal" },
  { id: "duelist", icon: "🔮", title: "En Garde!", desc: "Start an orb duel at the arena" },
  { id: "champion", icon: "🏅", title: "Arena Champion", desc: "Beat EPIC-BOT in an orb duel" },
  { id: "scientist", icon: "🧪", title: "Mad Scientist", desc: "Run all three Sim Lab experiments" },
  { id: "boing", icon: "🏀", title: "Bounce With Me", desc: "Kick a bounce cube across the plaza" },
]

const BOARDS = ["stats", "impact", "patch"]
const SIMS = ["sim-sand", "sim-boids", "sim-orbit"]
const STORE_KEY = "world:advancements:v1"

type Persisted = {
  unlocked: Record<string, number>
  openedChests: string[]
  boardsRead: string[]
  simsRun: string[]
  bestRunMs: number | null
}

const EMPTY: Persisted = { unlocked: {}, openedChests: [], boardsRead: [], simsRun: [], bestRunMs: null }

function load(): Persisted {
  if (typeof window === "undefined") return EMPTY
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<Persisted>
      return {
        unlocked: p.unlocked ?? {},
        openedChests: Array.isArray(p.openedChests) ? p.openedChests : [],
        boardsRead: Array.isArray(p.boardsRead) ? p.boardsRead : [],
        simsRun: Array.isArray(p.simsRun) ? p.simsRun : [],
        bestRunMs: typeof p.bestRunMs === "number" ? p.bestRunMs : null,
      }
    }
  } catch {}
  return EMPTY
}

type AchState = Persisted & {
  /** Pending unlock toasts, oldest first. */
  toasts: AchievementDef[]
  /** Chest-run timer start (first chest of a fresh run), epoch ms. */
  chestRunStart: number | null
  /** Most recently completed run, ms (null until a run finishes). */
  lastRunMs: number | null
  runSubmitted: boolean

  award: (id: string) => void
  trackPanel: (i: Interactable) => void
  trackPosition: (x: number, z: number) => void
  shiftToast: () => void
  resetRun: () => void
  markRunSubmitted: () => void
}

export const useAchievements = create<AchState>((set, get) => {
  const persist = () => {
    if (typeof window === "undefined") return
    const { unlocked, openedChests, boardsRead, simsRun, bestRunMs } = get()
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ unlocked, openedChests, boardsRead, simsRun, bestRunMs }))
    } catch {}
  }

  return {
    ...load(),
    toasts: [],
    chestRunStart: null,
    lastRunMs: null,
    runSubmitted: false,

    award: (id) => {
      const s = get()
      if (s.unlocked[id]) return
      const def = ACHIEVEMENTS.find((a) => a.id === id)
      if (!def) return
      set({
        unlocked: { ...s.unlocked, [id]: Date.now() },
        toasts: [...s.toasts, def],
      })
      persist()
    },

    trackPanel: (i) => {
      const s = get()
      const award = get().award
      switch (i.kind) {
        case "project": {
          if (s.openedChests.includes(i.id)) break
          const opened = [...s.openedChests, i.id]
          const patch: Partial<AchState> = { openedChests: opened }
          if (s.openedChests.length === 0 || s.chestRunStart === null) {
            patch.chestRunStart = s.chestRunStart ?? Date.now()
          }
          if (opened.length === PROJECT_CHESTS.length && s.chestRunStart) {
            const ms = Date.now() - s.chestRunStart
            patch.lastRunMs = ms
            patch.bestRunMs = s.bestRunMs === null ? ms : Math.min(s.bestRunMs, ms)
            patch.runSubmitted = false
          }
          set(patch)
          persist()
          award("first-chest")
          if (opened.length === PROJECT_CHESTS.length) award("all-chests")
          break
        }
        case "rag": award("navi"); break
        case "jukebox": award("dj"); break
        case "slot": award("gambler"); break
        case "contact": award("portal-walker"); break
        case "sim": {
          if (!s.simsRun.includes(i.id)) {
            const sims = [...s.simsRun, i.id]
            set({ simsRun: sims })
            persist()
            if (SIMS.every((id) => sims.includes(id))) award("scientist")
          }
          break
        }
        case "stats":
        case "impact":
        case "patch": {
          if (!s.boardsRead.includes(i.kind)) {
            const boards = [...s.boardsRead, i.kind]
            set({ boardsRead: boards })
            persist()
            if (BOARDS.every((b) => boards.includes(b))) award("scholar")
          }
          break
        }
      }
    },

    trackPosition: (x, z) => {
      const s = get()
      if (!s.unlocked["homeowner"] && x > -24 && x < -18 && z > 14.6 && z < 19.5) get().award("homeowner")
      if (!s.unlocked["explorer"] && (Math.abs(x) > 29 || Math.abs(z) > 29)) get().award("explorer")
    },

    shiftToast: () => set((s) => ({ toasts: s.toasts.slice(1) })),

    // Lets returning visitors replay the speedrun without losing advancements.
    resetRun: () => {
      set({ openedChests: [], chestRunStart: null, lastRunMs: null, runSubmitted: false })
      persist()
    },

    markRunSubmitted: () => set({ runSubmitted: true }),
  }
})

export function formatMs(ms: number): string {
  const totalSec = ms / 1000
  const m = Math.floor(totalSec / 60)
  const sec = (totalSec - m * 60).toFixed(1)
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}
