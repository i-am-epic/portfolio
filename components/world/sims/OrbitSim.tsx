"use client"

import { useEffect, useRef, useState } from "react"

/**
 * N-body orbit sandbox: drag from any point to slingshot a planet around the
 * central star. Semi-implicit Euler integration; planets optionally attract
 * each other and merge on contact (momentum-conserving). Trails come free
 * from fading the canvas instead of clearing it.
 */

const W = 576
const H = 384
const CX = W / 2
const CY = H / 2
const GM_STAR = 1.6e6 // star gravitational parameter, px³/s²
const STAR_R = 12
const DT = 1 / 60
const PLANET_COLORS = ["#7dd3fc", "#fbbf24", "#f472b6", "#4ade80", "#c084fc", "#fb923c"]

type Body = { x: number; y: number; vx: number; vy: number; m: number; r: number; color: string }

export function OrbitSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mutualRef = useRef(true)
  const [mutual, setMutual] = useState(true)
  mutualRef.current = mutual

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let bodies: Body[] = []
    let nextColor = 0

    const addPlanet = (x: number, y: number, vx: number, vy: number) => {
      bodies.push({ x, y, vx, vy, m: 300, r: 4, color: PLANET_COLORS[nextColor++ % PLANET_COLORS.length] })
    }

    const spawnOrbiters = () => {
      for (const r of [70, 110, 155]) {
        const a = Math.random() * Math.PI * 2
        const v = Math.sqrt(GM_STAR / r) // circular orbit speed
        addPlanet(CX + Math.cos(a) * r, CY + Math.sin(a) * r, -Math.sin(a) * v, Math.cos(a) * v)
      }
    }
    spawnOrbiters()

    const drag = { active: false, x0: 0, y0: 0, x1: 0, y1: 0 }
    const toLocal = (e: PointerEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect()
      return [((e.clientX - rect.left) / rect.width) * W, ((e.clientY - rect.top) / rect.height) * H]
    }
    const down = (e: PointerEvent) => {
      const [x, y] = toLocal(e)
      drag.active = true
      drag.x0 = drag.x1 = x
      drag.y0 = drag.y1 = y
      canvas.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!drag.active) return
      const [x, y] = toLocal(e)
      drag.x1 = x
      drag.y1 = y
    }
    const up = () => {
      if (!drag.active) return
      drag.active = false
      addPlanet(drag.x0, drag.y0, (drag.x1 - drag.x0) * 2.2, (drag.y1 - drag.y0) * 2.2)
    }
    canvas.addEventListener("pointerdown", down)
    canvas.addEventListener("pointermove", move)
    canvas.addEventListener("pointerup", up)
    canvas.addEventListener("pointercancel", up)

    const clear = () => { bodies = [] }
    const preset = () => { bodies = []; spawnOrbiters() }
    window.addEventListener("sim-orbit-clear", clear)
    window.addEventListener("sim-orbit-preset", preset)

    ctx.fillStyle = "#0b0d12"
    ctx.fillRect(0, 0, W, H)

    let raf = 0
    const loop = () => {
      // Gravity from the star (+ optionally from every other planet).
      for (const b of bodies) {
        let ax = 0, ay = 0
        const dx = CX - b.x, dy = CY - b.y
        const d2 = dx * dx + dy * dy
        const d = Math.sqrt(d2)
        if (d > 1) {
          const a = GM_STAR / d2
          ax += (dx / d) * a
          ay += (dy / d) * a
        }
        if (mutualRef.current) {
          for (const o of bodies) {
            if (o === b) continue
            const ox = o.x - b.x, oy = o.y - b.y
            const od2 = ox * ox + oy * oy
            if (od2 < 25) continue
            const od = Math.sqrt(od2)
            const a = (o.m * 60) / od2
            ax += (ox / od) * a
            ay += (oy / od) * a
          }
        }
        b.vx += ax * DT
        b.vy += ay * DT
      }
      for (const b of bodies) {
        b.x += b.vx * DT
        b.y += b.vy * DT
      }
      // Star absorption, escapes, planet mergers.
      bodies = bodies.filter((b) => {
        const d = Math.hypot(b.x - CX, b.y - CY)
        return d > STAR_R + b.r - 2 && d < 2200
      })
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i], b = bodies[j]
          if (Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r) {
            const m = a.m + b.m
            a.vx = (a.vx * a.m + b.vx * b.m) / m
            a.vy = (a.vy * a.m + b.vy * b.m) / m
            a.m = m
            a.r = Math.min(9, Math.cbrt(a.r ** 3 + b.r ** 3))
            bodies.splice(j, 1)
            j--
          }
        }
      }

      // Fade previous frame → motion trails.
      ctx.fillStyle = "rgba(11, 13, 18, 0.08)"
      ctx.fillRect(0, 0, W, H)

      // Star with glow.
      const grad = ctx.createRadialGradient(CX, CY, 2, CX, CY, STAR_R * 2.4)
      grad.addColorStop(0, "#fff7d6")
      grad.addColorStop(0.4, "#fbbf24")
      grad.addColorStop(1, "rgba(251,191,36,0)")
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(CX, CY, STAR_R * 2.4, 0, Math.PI * 2)
      ctx.fill()

      for (const b of bodies) {
        ctx.fillStyle = b.color
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Aim line while dragging.
      if (drag.active) {
        ctx.strokeStyle = "#e2e8f0"
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(drag.x0, drag.y0)
        ctx.lineTo(drag.x1, drag.y1)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = "#e2e8f0"
        ctx.beginPath()
        ctx.arc(drag.x0, drag.y0, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener("pointerdown", down)
      canvas.removeEventListener("pointermove", move)
      canvas.removeEventListener("pointerup", up)
      canvas.removeEventListener("pointercancel", up)
      window.removeEventListener("sim-orbit-clear", clear)
      window.removeEventListener("sim-orbit-preset", preset)
    }
  }, [])

  return (
    <div>
      <div className="mc-simbar">
        <button className="mc-btn mc-btn--ghost" style={{ fontSize: 12 }} onClick={() => window.dispatchEvent(new Event("sim-orbit-preset"))}>
          ☀ Spawn 3 orbiters
        </button>
        <button className="mc-btn mc-btn--ghost" style={{ fontSize: 12 }} onClick={() => window.dispatchEvent(new Event("sim-orbit-clear"))}>
          Clear
        </button>
        <button
          className="mc-btn mc-btn--ghost"
          style={{ fontSize: 12, color: mutual ? "#4ade80" : "#9aa0ac" }}
          onClick={() => setMutual((m) => !m)}
        >
          Planet gravity: {mutual ? "ON" : "OFF"}
        </button>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="mc-simcanvas" style={{ cursor: "crosshair" }} />
      <p style={{ fontSize: 12, color: "#9aa0ac", marginTop: 8 }}>
        Drag and release to slingshot a planet. Real n-body gravity — planets merge on impact and tug on each other.
      </p>
    </div>
  )
}
