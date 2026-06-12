import { create } from "zustand"
import { DUEL_TARGET_HITS, type Interactable } from "./worldData"
import { useAchievements } from "./achievements"

export type DuelPhase = "idle" | "countdown" | "playing" | "won" | "lost"

export type DuelState = {
  phase: DuelPhase
  playerHits: number
  botHits: number
  /** Epoch ms at which the 3-2-1 countdown finishes. */
  countdownEnd: number
}

const DUEL_IDLE: DuelState = { phase: "idle", playerHits: 0, botHits: 0, countdownEnd: 0 }

type WorldState = {
  /** Pointer is locked = player is "in" the game. */
  locked: boolean
  setLocked: (v: boolean) => void

  /** Interactable currently in front of the player (shows "Press E"). */
  target: Interactable | null
  setTarget: (t: Interactable | null) => void

  /** Open panel (set when player presses E). null = no panel. */
  activePanel: Interactable | null
  openPanel: (i: Interactable) => void
  closePanel: () => void

  /** Live player position for the HUD coordinate read-out. */
  coords: [number, number, number]
  setCoords: (c: [number, number, number]) => void

  muted: boolean
  toggleMuted: () => void

  /** True once the player has clicked "Enter World" at least once. */
  started: boolean
  setStarted: (v: boolean) => void

  /** Coarse-pointer device: on-screen joystick instead of pointer lock. */
  touch: boolean
  setTouch: (v: boolean) => void

  /**
   * Pointer lock is unavailable (iframe without allow="pointer-lock",
   * in-app webviews, some embeds). Mouse drag-to-look replaces it.
   */
  lockFallback: boolean
  setLockFallback: (v: boolean) => void

  /** Orb duel vs EPIC-BOT in the arena. */
  duel: DuelState
  startDuel: () => void
  setDuelPhase: (p: DuelPhase) => void
  scoreDuel: (who: "player" | "bot") => void
  endDuel: () => void
}

export const useWorld = create<WorldState>((set, get) => ({
  locked: false,
  setLocked: (v) => set({ locked: v }),

  target: null,
  setTarget: (t) =>
    set((s) => (s.target?.id === t?.id ? s : { target: t })),

  activePanel: null,
  openPanel: (i) => {
    // Opening any panel forfeits an in-progress duel so the bot never keeps
    // throwing at a player who is reading a chest.
    set((s) => (s.duel.phase === "idle" ? { activePanel: i } : { activePanel: i, duel: DUEL_IDLE }))
    useAchievements.getState().trackPanel(i)
  },
  closePanel: () => set({ activePanel: null }),

  coords: [0, 0, 0],
  setCoords: (c) => set({ coords: c }),

  muted: true,
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  started: false,
  setStarted: (v) => set({ started: v }),

  touch: false,
  setTouch: (v) => set({ touch: v }),

  lockFallback: false,
  setLockFallback: (v) => set({ lockFallback: v }),

  duel: DUEL_IDLE,
  startDuel: () => {
    set({ duel: { phase: "countdown", playerHits: 0, botHits: 0, countdownEnd: Date.now() + 3000 } })
    useAchievements.getState().award("duelist")
  },
  setDuelPhase: (p) => set((s) => ({ duel: { ...s.duel, phase: p } })),
  scoreDuel: (who) => {
    const s = get()
    if (s.duel.phase !== "playing") return
    const playerHits = s.duel.playerHits + (who === "player" ? 1 : 0)
    const botHits = s.duel.botHits + (who === "bot" ? 1 : 0)
    let phase: DuelPhase = "playing"
    if (playerHits >= DUEL_TARGET_HITS) phase = "won"
    else if (botHits >= DUEL_TARGET_HITS) phase = "lost"
    set({ duel: { ...s.duel, playerHits, botHits, phase } })
    if (phase === "won") useAchievements.getState().award("champion")
  },
  endDuel: () => set({ duel: DUEL_IDLE }),
}))

/**
 * True when the player is "in" the game and input should steer the camera:
 * touch and lock-fallback modes only need the world started; desktop pointer
 * lock additionally requires the lock to be held.
 */
export function isPlayerActive(s: Pick<WorldState, "touch" | "lockFallback" | "started" | "locked">): boolean {
  return s.touch || s.lockFallback ? s.started : s.locked
}

// Dev-only debugging handle (stripped from production builds).
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  ;(window as unknown as { __world?: typeof useWorld }).__world = useWorld
}
