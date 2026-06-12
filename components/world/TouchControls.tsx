"use client"

import { useEffect, useRef } from "react"
import { useWorld } from "@/lib/world/store"
import { touchInput } from "@/lib/world/touchInput"

const STICK_RADIUS = 56

/**
 * On-screen controls for coarse-pointer devices: a left-thumb joystick for
 * movement, drag-anywhere-else to look, plus jump and interact buttons.
 * Writes into the shared touchInput channel; never re-renders per frame.
 */
export function TouchControls() {
  const target = useWorld((s) => s.target)
  const openPanel = useWorld((s) => s.openPanel)
  const dueling = useWorld((s) => s.duel.phase === "playing")

  const baseRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const stickId = useRef<number | null>(null)
  const stickOrigin = useRef<[number, number]>([0, 0])
  const lookId = useRef<number | null>(null)
  const lookLast = useRef<[number, number]>([0, 0])

  useEffect(() => {
    const setKnob = (dx: number, dy: number) => {
      if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`
    }

    const onStart = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        const el = t.target as HTMLElement
        // Buttons handle their own taps; don't claim those touches.
        if (el.closest(".mc-touch-btn, .mc-hotbar, .mc-topright, .mc-prompt")) continue
        if (el.closest(".mc-stick") && stickId.current === null) {
          stickId.current = t.identifier
          const rect = baseRef.current!.getBoundingClientRect()
          stickOrigin.current = [rect.left + rect.width / 2, rect.top + rect.height / 2]
          e.preventDefault()
        } else if (lookId.current === null && !el.closest(".mc-stick")) {
          lookId.current = t.identifier
          lookLast.current = [t.clientX, t.clientY]
        }
      }
    }

    const onMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === stickId.current) {
          const dx = t.clientX - stickOrigin.current[0]
          const dy = t.clientY - stickOrigin.current[1]
          const len = Math.hypot(dx, dy)
          const cap = Math.min(len, STICK_RADIUS)
          const nx = len > 0 ? (dx / len) * cap : 0
          const ny = len > 0 ? (dy / len) * cap : 0
          setKnob(nx, ny)
          touchInput.move.x = nx / STICK_RADIUS
          touchInput.move.y = -ny / STICK_RADIUS
          e.preventDefault()
        } else if (t.identifier === lookId.current) {
          touchInput.lookDX += t.clientX - lookLast.current[0]
          touchInput.lookDY += t.clientY - lookLast.current[1]
          lookLast.current = [t.clientX, t.clientY]
          e.preventDefault()
        }
      }
    }

    const onEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === stickId.current) {
          stickId.current = null
          touchInput.move.x = 0
          touchInput.move.y = 0
          setKnob(0, 0)
        } else if (t.identifier === lookId.current) {
          lookId.current = null
        }
      }
    }

    window.addEventListener("touchstart", onStart, { passive: false })
    window.addEventListener("touchmove", onMove, { passive: false })
    window.addEventListener("touchend", onEnd)
    window.addEventListener("touchcancel", onEnd)
    return () => {
      window.removeEventListener("touchstart", onStart)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onEnd)
      window.removeEventListener("touchcancel", onEnd)
      touchInput.move.x = 0
      touchInput.move.y = 0
      touchInput.lookDX = 0
      touchInput.lookDY = 0
    }
  }, [])

  return (
    <>
      <div className="mc-stick" ref={baseRef}>
        <div className="mc-stick__knob" ref={knobRef} />
      </div>

      <div className="mc-touch-actions">
        {dueling && (
          <button
            className="mc-btn mc-btn--accent mc-touch-btn"
            style={{ fontSize: 15 }}
            onTouchStart={(e) => {
              e.stopPropagation()
              touchInput.throwOrb = true
            }}
          >
            🔮 Throw
          </button>
        )}
        {target && !dueling && (
          <button
            className="mc-btn mc-btn--accent mc-touch-btn mc-touch-btn--interact"
            onClick={() => openPanel(target)}
          >
            ✦ {target.title}
          </button>
        )}
        <button
          className="mc-btn mc-btn--blue mc-touch-btn"
          onTouchStart={(e) => {
            e.stopPropagation()
            touchInput.jump = true
          }}
        >
          ⤒
        </button>
      </div>
    </>
  )
}
