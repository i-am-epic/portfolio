"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { SlotMachine } from "@/components/world/SlotMachine"
import "@/app/world/world.css"

const SYMS = ["💎", "🟩", "🪙", "⛏️", "🍎", "⭐", "🍀", "🎰"]

function MiniReels() {
  const [r, setR] = useState([0, 3, 5])
  useEffect(() => {
    const id = setInterval(() => setR((p) => p.map(() => (Math.random() * SYMS.length) | 0)), 750)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="slot-mini" aria-hidden>
      {r.map((s, i) => <span key={i}>{SYMS[s]}</span>)}
    </div>
  )
}

/**
 * Floating "Lucky Blocks" slot launcher for the classic site — a side cabinet on
 * desktop, a bottom card on mobile. The 3D world exposes slots via its hotbar.
 */
export function SlotLauncher() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  if (pathname?.startsWith("/world")) return null

  return (
    <>
      {isMobile ? (
        <button className="slot-card" onClick={() => setOpen(true)} aria-label="Play Lucky Blocks slots">
          <span className="slot-card-icon">🎰</span>
          <span className="slot-card-text">
            <b>Lucky Blocks</b>
            <small>Tap to spin &amp; win coins</small>
          </span>
          <MiniReels />
        </button>
      ) : (
        <button className="slot-tab" onClick={() => setOpen(true)} aria-label="Play Lucky Blocks slots" title="Lucky Blocks slots">
          <span className="slot-tab-title">SLOTS</span>
          <MiniReels />
          <span className="slot-tab-coin">🎰</span>
        </button>
      )}

      {open && (
        <div className="mc-overlay mc" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <SlotMachine onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
