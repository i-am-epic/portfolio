"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Falling-sand cellular automaton. Every pixel is a cell with a material and
 * dead-simple local rules — sand falls and piles, water flows and levels out,
 * fire rises and burns plants, stone just sits there. Complexity for free.
 */

const W = 144
const H = 96
const SCALE = 4

const EMPTY = 0, SAND = 1, WATER = 2, STONE = 3, FIRE = 4, PLANT = 5

const ELEMENTS = [
  { id: SAND, label: "Sand", color: "#fbbf24" },
  { id: WATER, label: "Water", color: "#38bdf8" },
  { id: STONE, label: "Stone", color: "#9ca3af" },
  { id: PLANT, label: "Plant", color: "#4ade80" },
  { id: FIRE, label: "Fire", color: "#f87171" },
  { id: EMPTY, label: "Erase", color: "#6b7280" },
]

// Base RGB per material; per-cell shade noise is added at render time.
const COLOR: Record<number, [number, number, number]> = {
  [EMPTY]: [11, 13, 18],
  [SAND]: [233, 196, 106],
  [WATER]: [56, 152, 224],
  [STONE]: [120, 124, 134],
  [FIRE]: [244, 110, 60],
  [PLANT]: [74, 200, 110],
}

export function SandSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [element, setElement] = useState(SAND)
  const [paused, setPaused] = useState(false)
  const elementRef = useRef(element)
  const pausedRef = useRef(paused)
  elementRef.current = element
  pausedRef.current = paused

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    ctx.imageSmoothingEnabled = false

    const grid = new Uint8Array(W * H)
    const life = new Uint8Array(W * H) // fire lifetimes
    const shade = new Uint8Array(W * H)
    for (let i = 0; i < shade.length; i++) shade[i] = (Math.random() * 24) | 0

    // Starter scene: a stone bowl with a sand dune and a plant patch.
    for (let x = 30; x < 114; x++) grid[(H - 10) * W + x] = STONE
    for (let y = H - 24; y < H - 10; y++) { grid[y * W + 30] = STONE; grid[y * W + 113] = STONE }
    for (let x = 55; x < 90; x++) for (let y = H - 30; y < H - 12; y++) if (Math.random() < 0.5) grid[y * W + x] = SAND
    for (let x = 36; x < 50; x++) grid[(H - 11) * W + x] = PLANT

    const buf = document.createElement("canvas")
    buf.width = W
    buf.height = H
    const bctx = buf.getContext("2d")!
    const img = bctx.createImageData(W, H)

    const idx = (x: number, y: number) => y * W + x
    const inB = (x: number, y: number) => x >= 0 && x < W && y >= 0 && y < H

    const swap = (a: number, b: number) => {
      const t = grid[a]; grid[a] = grid[b]; grid[b] = t
      const tl = life[a]; life[a] = life[b]; life[b] = tl
    }

    const step = () => {
      // Bottom-up so falling materials move once per tick; randomize x
      // direction per row to avoid directional bias.
      for (let y = H - 1; y >= 0; y--) {
        const ltr = Math.random() < 0.5
        for (let xi = 0; xi < W; xi++) {
          const x = ltr ? xi : W - 1 - xi
          const i = idx(x, y)
          const m = grid[i]
          if (m === EMPTY || m === STONE) continue

          if (m === SAND) {
            const below = idx(x, y + 1)
            if (y + 1 < H && (grid[below] === EMPTY || grid[below] === WATER)) { swap(i, below); continue }
            const d = Math.random() < 0.5 ? -1 : 1
            if (inB(x + d, y + 1) && grid[idx(x + d, y + 1)] === EMPTY) { swap(i, idx(x + d, y + 1)); continue }
            if (inB(x - d, y + 1) && grid[idx(x - d, y + 1)] === EMPTY) { swap(i, idx(x - d, y + 1)); continue }
          } else if (m === WATER) {
            const below = idx(x, y + 1)
            if (y + 1 < H && grid[below] === EMPTY) { swap(i, below); continue }
            const d = Math.random() < 0.5 ? -1 : 1
            if (inB(x + d, y + 1) && grid[idx(x + d, y + 1)] === EMPTY) { swap(i, idx(x + d, y + 1)); continue }
            if (inB(x + d, y) && grid[idx(x + d, y)] === EMPTY) { swap(i, idx(x + d, y)); continue }
            if (inB(x - d, y) && grid[idx(x - d, y)] === EMPTY) { swap(i, idx(x - d, y)); continue }
          } else if (m === FIRE) {
            if (life[i] === 0) { grid[i] = EMPTY; continue }
            life[i]--
            // Ignite neighbours; water quenches.
            let quenched = false
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
              if (!inB(x + dx, y + dy)) continue
              const n = idx(x + dx, y + dy)
              if (grid[n] === PLANT && Math.random() < 0.35) { grid[n] = FIRE; life[n] = 28 }
              if (grid[n] === WATER) { grid[i] = EMPTY; quenched = true; break }
            }
            if (quenched) continue
            // Flicker upward.
            const d = Math.random() < 0.5 ? -1 : 1
            if (y > 0 && grid[idx(x, y - 1)] === EMPTY && Math.random() < 0.7) swap(i, idx(x, y - 1))
            else if (inB(x + d, y - 1) && grid[idx(x + d, y - 1)] === EMPTY) swap(i, idx(x + d, y - 1))
          } else if (m === PLANT) {
            // Plants slowly grow upward when touching water.
            if (y > 0 && grid[idx(x, y - 1)] === EMPTY && Math.random() < 0.002) {
              let wet = false
              for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1]] as const) {
                if (inB(x + dx, y + dy) && grid[idx(x + dx, y + dy)] === WATER) { wet = true; break }
              }
              if (wet) grid[idx(x, y - 1)] = PLANT
            }
          }
        }
      }
    }

    const render = () => {
      const d = img.data
      for (let i = 0; i < grid.length; i++) {
        const m = grid[i]
        const [r, g, b] = COLOR[m]
        const sh = m === EMPTY ? 0 : shade[i]
        const flicker = m === FIRE ? (Math.random() * 60) | 0 : 0
        const o = i * 4
        d[o] = Math.min(255, r + sh + flicker)
        d[o + 1] = Math.min(255, g + sh + (flicker >> 1))
        d[o + 2] = b + sh
        d[o + 3] = 255
      }
      bctx.putImageData(img, 0, 0)
      ctx.drawImage(buf, 0, 0, W * SCALE, H * SCALE)
    }

    // --- painting ---
    let painting = false
    const paint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const cx = Math.floor(((e.clientX - rect.left) / rect.width) * W)
      const cy = Math.floor(((e.clientY - rect.top) / rect.height) * H)
      const el = elementRef.current
      const r = 3
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r * r) continue
          if (!inB(cx + dx, cy + dy)) continue
          if (el !== EMPTY && Math.random() < 0.4) continue // speckled brush
          const i = idx(cx + dx, cy + dy)
          grid[i] = el
          if (el === FIRE) life[i] = 30
        }
      }
    }
    const down = (e: PointerEvent) => { painting = true; canvas.setPointerCapture(e.pointerId); paint(e) }
    const move = (e: PointerEvent) => { if (painting) paint(e) }
    const up = () => { painting = false }
    canvas.addEventListener("pointerdown", down)
    canvas.addEventListener("pointermove", move)
    canvas.addEventListener("pointerup", up)
    canvas.addEventListener("pointercancel", up)

    const clear = () => { grid.fill(EMPTY); life.fill(0) }
    window.addEventListener("sim-sand-clear", clear)

    let raf = 0
    const loop = () => {
      if (!pausedRef.current) { step(); step() }
      render()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener("pointerdown", down)
      canvas.removeEventListener("pointermove", move)
      canvas.removeEventListener("pointerup", up)
      canvas.removeEventListener("pointercancel", up)
      window.removeEventListener("sim-sand-clear", clear)
    }
  }, [])

  return (
    <div>
      <div className="mc-simbar">
        {ELEMENTS.map((el) => (
          <button
            key={el.id}
            className="mc-btn mc-btn--ghost"
            style={{ fontSize: 12, color: el.color, outline: element === el.id ? `2px solid ${el.color}` : "none" }}
            onClick={() => setElement(el.id)}
          >
            {el.label}
          </button>
        ))}
        <button className="mc-btn mc-btn--ghost" style={{ fontSize: 12 }} onClick={() => setPaused((p) => !p)}>
          {paused ? "▶ Play" : "⏸ Pause"}
        </button>
        <button className="mc-btn mc-btn--ghost" style={{ fontSize: 12 }} onClick={() => window.dispatchEvent(new Event("sim-sand-clear"))}>
          Clear
        </button>
      </div>
      <canvas ref={canvasRef} width={W * SCALE} height={H * SCALE} className="mc-simcanvas" />
      <p style={{ fontSize: 12, color: "#9aa0ac", marginTop: 8 }}>
        Draw with the mouse. Sand piles, water levels out, fire eats plants — every pixel only knows its neighbours.
      </p>
    </div>
  )
}
