/**
 * Shared mutable channel between the on-screen touch controls (DOM overlay)
 * and the FirstPersonController (inside the R3F canvas). A plain object is
 * deliberate: values change every frame and must not trigger React renders.
 */

export const touchInput = {
  /** Joystick vector, each axis in [-1, 1]. y > 0 = forward. */
  move: { x: 0, y: 0 },
  /** Look deltas in px, accumulated since the controller last consumed them. */
  lookDX: 0,
  lookDY: 0,
  /** One-shot jump request (consumed by the controller). */
  jump: false,
  /** One-shot orb-throw request during a duel (consumed by the arena). */
  throwOrb: false,
}

export function consumeLook(): [number, number] {
  const d: [number, number] = [touchInput.lookDX, touchInput.lookDY]
  touchInput.lookDX = 0
  touchInput.lookDY = 0
  return d
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia?.("(pointer: coarse)")?.matches || "ontouchstart" in window
}
