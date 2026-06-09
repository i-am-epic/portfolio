import { create } from "zustand"
import type { Interactable } from "./worldData"

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
}

export const useWorld = create<WorldState>((set) => ({
  locked: false,
  setLocked: (v) => set({ locked: v }),

  target: null,
  setTarget: (t) =>
    set((s) => (s.target?.id === t?.id ? s : { target: t })),

  activePanel: null,
  openPanel: (i) => set({ activePanel: i }),
  closePanel: () => set({ activePanel: null }),

  coords: [0, 0, 0],
  setCoords: (c) => set({ coords: c }),

  muted: true,
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  started: false,
  setStarted: (v) => set({ started: v }),
}))

// Dev-only debugging handle (stripped from production builds).
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  ;(window as unknown as { __world?: typeof useWorld }).__world = useWorld
}
