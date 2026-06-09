"use client"

import { useEffect, useRef } from "react"
import type { Scroll } from "@/lib/scrolls"
import { playClink, playRipple, playSplash } from "@/lib/scrollAudio"

type Bottle = {
  id: string
  scroll: Scroll
  x: number
  vx: number
  scale: number
  w: number
  phase: number
  y: number
  vy: number
  entering: boolean
  rot: number
}

type Ripple = { x: number; y: number; r: number; a: number }

const SPRITE_RATIO = 40 / 84
const MIN_SPEED = 6

export function WaterCanvas({ scrolls, onRead, onCast }: { scrolls: Scroll[]; onRead: (s: Scroll) => void; onCast?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bottles = useRef<Bottle[]>([])
  const ripples = useRef<Ripple[]>([])
  const img = useRef<HTMLImageElement | null>(null)
  const size = useRef({ w: 0, h: 0 })
  const lastClink = useRef(0)
  const lastRippleSound = useRef(0)
  const lastMove = useRef(0)

  useEffect(() => {
    const i = new Image()
    i.src = "/scroll/bottle.png"
    i.onload = () => { img.current = i }
  }, [])

  // sync bottle list with incoming scrolls (new ones splash in from above)
  useEffect(() => {
    const w = size.current.w || (typeof window !== "undefined" ? window.innerWidth : 700)
    // cap so bottles always fit the width without permanent overlap (declumps)
    const cap = Math.max(5, Math.min(16, Math.floor(w / 96)))
    const want = scrolls.slice(0, cap)
    const wantIds = new Set(want.map((s) => s.id))
    const haveIds = new Set(bottles.current.map((b) => b.id))
    bottles.current = bottles.current.filter((b) => wantIds.has(b.id))
    for (const s of want) {
      if (!haveIds.has(s.id)) {
        const scale = 0.82 + Math.random() * 0.28
        bottles.current.unshift({
          id: s.id, scroll: s, x: 40 + Math.random() * Math.max(60, w - 80),
          vx: (Math.random() < 0.5 ? -1 : 1) * (MIN_SPEED + 6 + Math.random() * 10),
          scale, w: 72 * scale, phase: Math.random() * Math.PI * 2,
          y: -30, vy: 0, entering: true, rot: 0,
        })
      }
    }
    bottles.current.sort((a, b) => a.scale - b.scale)
  }, [scrolls])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let prev = performance.now()

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const r = canvas.getBoundingClientRect()
      size.current = { w: r.width, h: r.height }
      canvas.width = Math.max(1, Math.round(r.width * dpr))
      canvas.height = Math.max(1, Math.round(r.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      const { w, h } = size.current
      const t = now / 1000
      const waterY = 24
      const surf = (x: number) => waterY + Math.sin(x * 0.03 + t * 1.1) * 2.5 + Math.sin(x * 0.013 - t * 0.7) * 1.8

      ctx.clearRect(0, 0, w, h)

      // deep water body
      const g = ctx.createLinearGradient(0, waterY, 0, h)
      g.addColorStop(0, "#4a90cf"); g.addColorStop(0.45, "#1f5f9e"); g.addColorStop(1, "#082a55")
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 6) ctx.lineTo(x, surf(x))
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fill()

      // caustic shimmer
      ctx.lineWidth = 2
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(190,230,255,${0.06 - i * 0.015})`
        ctx.beginPath()
        const yy = waterY + 26 + i * 24
        for (let x = 0; x <= w; x += 12) ctx.lineTo(x, yy + Math.sin(x * 0.05 + t * (0.6 + i * 0.2)) * 3)
        ctx.stroke()
      }

      // ripples (on the surface, under bottles)
      const rips = ripples.current
      for (let i = rips.length - 1; i >= 0; i--) {
        const rp = rips[i]
        rp.r += 64 * dt; rp.a -= 0.85 * dt
        if (rp.a <= 0) { rips.splice(i, 1); continue }
        ctx.strokeStyle = `rgba(214,242,255,${rp.a})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.32, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      const bs = bottles.current

      // physics: entry fall, drift, edge bounce
      for (const b of bs) {
        if (b.entering) {
          b.vy += 140 * dt
          b.y += b.vy * dt
          if (b.y >= surf(b.x) - 2) {
            b.entering = false; b.vy = 0
            ripples.current.push({ x: b.x, y: surf(b.x) + 2, r: 6, a: 0.95 })
            const ms = now; if (ms - lastRippleSound.current > 120) { playSplash(); lastRippleSound.current = ms }
          }
        } else {
          b.x += b.vx * dt
          // never let a bottle stall — keeps them drifting apart instead of clumping
          if (Math.abs(b.vx) < MIN_SPEED) b.vx = (b.vx >= 0 ? 1 : -1) * MIN_SPEED
          const m = b.w * 0.42
          if (b.x < m) { b.x = m; b.vx = Math.abs(b.vx) }
          if (b.x > w - m) { b.x = w - m; b.vx = -Math.abs(b.vx) }
        }
      }

      // pairwise collisions — separate fully and bounce APART (no sticking)
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i], c = bs[j]
          if (a.entering || c.entering) continue
          const minD = (a.w + c.w) * 0.44
          const dx = c.x - a.x
          const d = Math.abs(dx)
          if (d < minD) {
            const dir = d > 0.01 ? dx / d : (Math.random() < 0.5 ? -1 : 1)
            const push = (minD - d) / 2 + 0.75 // separate beyond touching so they don't re-collide
            a.x -= dir * push; c.x += dir * push
            const speed = Math.max(MIN_SPEED + 1, (Math.abs(a.vx) + Math.abs(c.vx)) / 2)
            a.vx = -dir * speed; c.vx = dir * speed // move away from each other
            a.rot = -dir * 0.28; c.rot = dir * 0.28
            const ms = now
            if (ms - lastClink.current > 320) {
              playClink(); lastClink.current = ms
              ripples.current.push({ x: (a.x + c.x) / 2, y: surf((a.x + c.x) / 2) + 2, r: 4, a: 0.5 })
            }
          }
        }
      }

      // draw bottles (full)
      const sprite = img.current
      for (const b of bs) {
        const bob = b.entering ? 0 : Math.sin(t * 1.6 + b.phase) * 4
        const cy = b.entering ? b.y : surf(b.x) + bob + 4
        b.rot += -b.rot * Math.min(1, dt * 4)
        const slope = Math.cos(b.x * 0.03 + t * 1.1) * 0.05
        const wpx = b.w, hpx = b.w * SPRITE_RATIO
        // soft shadow on the water
        ctx.save()
        ctx.globalAlpha = 0.18
        ctx.fillStyle = "#062038"
        ctx.beginPath(); ctx.ellipse(b.x, cy + hpx * 0.4, wpx * 0.42, 4, 0, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
        // bottle
        ctx.save()
        ctx.translate(b.x, cy)
        ctx.rotate(slope + b.rot)
        ctx.imageSmoothingEnabled = false
        if (sprite) ctx.drawImage(sprite, -wpx / 2, -hpx / 2, wpx, hpx)
        ctx.restore()
      }

      // half-sink tint: everything below the wavy surface gets an underwater wash
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 6) ctx.lineTo(x, surf(x))
      ctx.lineTo(w, h); ctx.closePath()
      ctx.clip()
      ctx.fillStyle = "rgba(20,80,140,0.4)"
      ctx.fillRect(0, 0, w, h)
      ctx.restore()

      // crisp foam waterline on top (cuts the bottles at the half-sink line)
      ctx.strokeStyle = "rgba(208,240,255,0.85)"
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let x = 0; x <= w; x += 6) { const y = surf(x); if (x === 0) ctx.moveTo(0, y); else ctx.lineTo(x, y) }
      ctx.stroke()
      // meniscus glints at each bottle
      for (const b of bs) {
        if (b.entering) continue
        ctx.fillStyle = "rgba(220,245,255,0.5)"
        ctx.beginPath(); ctx.ellipse(b.x, surf(b.x), b.w * 0.3, 2.5, 0, 0, Math.PI * 2); ctx.fill()
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])

  const onMove = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = Math.max(26, e.clientY - r.top)
    const now = performance.now()
    if (now - lastMove.current > 28) {
      ripples.current.push({ x, y, r: 4, a: 0.5 })
      lastMove.current = now
    }
    if (now - lastRippleSound.current > 260) { playRipple(); lastRippleSound.current = now }
  }

  const onClick = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - r.left
    let best: Bottle | null = null
    let bd = Infinity
    for (const b of bottles.current) {
      const d = Math.abs(b.x - x)
      if (d < b.w * 0.6 && d < bd) { bd = d; best = b }
    }
    if (best) {
      ripples.current.push({ x: best.x, y: 26, r: 6, a: 0.8 })
      onRead(best.scroll)
    } else {
      // tapping open water casts a new scroll
      const y = Math.max(26, e.clientY - canvasRef.current!.getBoundingClientRect().top)
      ripples.current.push({ x, y, r: 6, a: 0.7 })
      onCast?.()
    }
  }

  return <canvas ref={canvasRef} className="sw-canvas" onMouseMove={onMove} onClick={onClick} aria-hidden />
}
