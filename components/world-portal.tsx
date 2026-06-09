"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { playThrow } from "@/lib/scrollAudio"
import "./world-portal.css"

/**
 * A Minecraft grass-block on a hanging cord (classic pages). Clicking it plays a
 * bubbly circular reveal that grows from the click point, then enters /world.
 */
export function WorldPortal() {
  const pathname = usePathname()
  const router = useRouter()
  const [reveal, setReveal] = useState<{ x: number; y: number } | null>(null)
  const [pulling, setPulling] = useState(false)

  if (pathname?.startsWith("/world")) return null

  const enter = (e: React.MouseEvent) => {
    if (reveal) return
    try { playThrow() } catch {}
    setPulling(true)
    setReveal({ x: e.clientX, y: e.clientY })
    setTimeout(() => router.push("/world"), 700)
  }

  return (
    <>
      <div className={`wp-hang ${pulling ? "wp-pulling" : ""}`}>
        <div className="wp-wire" />
        <button className="wp-block" onClick={enter} aria-label="Enter the 3D Minecraft world">
          <img src="/textures/blocks/grass_side.png" alt="" className="wp-block-img" />
          <span className="wp-label">⛏ Enter the World</span>
        </button>
      </div>

      {reveal && (
        <>
          <div className="wp-reveal" style={{ left: reveal.x, top: reveal.y }} />
          <span className="wp-reveal-label">Entering the world…</span>
        </>
      )}
    </>
  )
}
