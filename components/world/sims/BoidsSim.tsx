"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Boids flocking sandbox: three steering rules (separation, alignment,
 * cohesion) produce bird-flock behaviour with zero central control. The
 * cursor acts as a hawk the flock avoids. Sliders feed refs, not state —
 * the rAF loop reads them live without re-rendering.
 */

const W = 576
const H = 384
const N = 130

type Boid = { x: number; y: number; vx: number; vy: number }

export function BoidsSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const params = useRef({ cohesion: 1, alignment: 1, separation: 1, speed: 1 })
  const [, bump] = useState(0) // re-render sliders only

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    const boids: Boid[] = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
    }))

    const mouse = { x: -999, y: -999, active: false }
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * W
      mouse.y = ((e.clientY - rect.top) / rect.height) * H
      mouse.active = true
    }
    const onLeave = () => { mouse.active = false }
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerdown", onMove)
    canvas.addEventListener("pointerleave", onLeave)

    let raf = 0
    const loop = () => {
      const p = params.current
      const R = 42, SEP = 16
      const maxSpeed = 2.6 * p.speed + 0.6

      for (let i = 0; i < N; i++) {
        const b = boids[i]
        let cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0, count = 0
        for (let j = 0; j < N; j++) {
          if (i === j) continue
          const o = boids[j]
          let dx = o.x - b.x
          let dy = o.y - b.y
          // wrap-aware distance
          if (dx > W / 2) dx -= W; if (dx < -W / 2) dx += W
          if (dy > H / 2) dy -= H; if (dy < -H / 2) dy += H
          const d2 = dx * dx + dy * dy
          if (d2 > R * R) continue
          count++
          cx += dx; cy += dy
          ax += o.vx; ay += o.vy
          if (d2 < SEP * SEP && d2 > 0.01) { sx -= dx / d2; sy -= dy / d2 }
        }
        if (count > 0) {
          b.vx += (cx / count) * 0.004 * p.cohesion + (ax / count - b.vx) * 0.045 * p.alignment + sx * 6 * p.separation
          b.vy += (cy / count) * 0.004 * p.cohesion + (ay / count - b.vy) * 0.045 * p.alignment + sy * 6 * p.separation
        }
        // flee the cursor-hawk
        if (mouse.active) {
          const dx = b.x - mouse.x, dy = b.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < 70 * 70 && d2 > 1) {
            const d = Math.sqrt(d2)
            b.vx += (dx / d) * 0.55
            b.vy += (dy / d) * 0.55
          }
        }
        const sp = Math.hypot(b.vx, b.vy)
        if (sp > maxSpeed) { b.vx = (b.vx / sp) * maxSpeed; b.vy = (b.vy / sp) * maxSpeed }
        if (sp < 1) { b.vx = (b.vx / Math.max(sp, 0.01)) * 1; b.vy = (b.vy / Math.max(sp, 0.01)) * 1 }
        b.x = (b.x + b.vx + W) % W
        b.y = (b.y + b.vy + H) % H
      }

      ctx.fillStyle = "#0b0d12"
      ctx.fillRect(0, 0, W, H)
      // hawk
      if (mouse.active) {
        ctx.fillStyle = "#f8717155"
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = "#7dd3fc"
      for (const b of boids) {
        const a = Math.atan2(b.vy, b.vx)
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(a)
        ctx.beginPath()
        ctx.moveTo(5, 0)
        ctx.lineTo(-4, 3)
        ctx.lineTo(-4, -3)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerdown", onMove)
      canvas.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  const slider = (key: keyof typeof params.current, label: string) => (
    <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#cbd5e1" }}>
      <span style={{ width: 84 }}>{label}</span>
      <input
        type="range"
        min={0}
        max={2}
        step={0.05}
        defaultValue={params.current[key]}
        onChange={(e) => { params.current[key] = Number(e.target.value); bump((n) => n + 1) }}
        style={{ flex: 1 }}
      />
      <span style={{ width: 32, textAlign: "right", color: "#7dd3fc" }}>{params.current[key].toFixed(1)}</span>
    </label>
  )

  return (
    <div>
      <canvas ref={canvasRef} width={W} height={H} className="mc-simcanvas" />
      <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
        {slider("cohesion", "Cohesion")}
        {slider("alignment", "Alignment")}
        {slider("separation", "Separation")}
        {slider("speed", "Speed")}
      </div>
      <p style={{ fontSize: 12, color: "#9aa0ac", marginTop: 8 }}>
        Your cursor is a hawk — chase the flock. Three local rules, no leader, and it still moves like one animal.
      </p>
    </div>
  )
}
