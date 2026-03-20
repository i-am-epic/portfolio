"use client"

import { useEffect } from "react"

export function AnimatedFavicon() {
    useEffect(() => {
        const SIZE = 64
        const canvas = document.createElement("canvas")
        canvas.width = SIZE
        canvas.height = SIZE
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Grab existing icon link or create one
        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
        if (!link) {
            link = document.createElement("link")
            link.rel = "icon"
            document.head.appendChild(link)
        }

        let frame = 0
        const TOTAL = 90 // frames per cycle (~3.75 s at 24fps)

        // Chart points to animate through
        const pts: [number, number][] = [
            // Letter N: down-left | diagonal | down-right
            [14, 12],  // top-left
            [14, 52],  // bottom-left  (left vertical)
            [50, 12],  // top-right    (diagonal)
            [50, 52],  // bottom-right (right vertical)
        ]

        const drawBg = () => {
            ctx.fillStyle = "#10131f"
            if (ctx.roundRect) {
                ctx.beginPath()
                ctx.roundRect(0, 0, SIZE, SIZE, 12)
                ctx.fill()
            } else {
                ctx.fillRect(0, 0, SIZE, SIZE)
            }
        }

        const tick = () => {
            // progress loops 0 → 1 → 0 with a brief pause at ends
            const raw = (frame % TOTAL) / TOTAL
            // ease-in-out: slow at start and finish
            const p = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2

            ctx.clearRect(0, 0, SIZE, SIZE)
            drawBg()

            const g = ctx.createLinearGradient(0, 0, SIZE, SIZE)
            g.addColorStop(0, "#ff7a48")
            g.addColorStop(1, "#77a6ff")

            ctx.strokeStyle = g
            ctx.lineWidth = 5
            ctx.lineCap = "round"
            ctx.lineJoin = "round"

            const maxI = p * (pts.length - 1)
            ctx.beginPath()
            ctx.moveTo(pts[0][0], pts[0][1])

            for (let i = 1; i < pts.length; i++) {
                if (i <= maxI) {
                    ctx.lineTo(pts[i][0], pts[i][1])
                } else if (i - 1 < maxI) {
                    const t = maxI - (i - 1)
                    ctx.lineTo(
                        pts[i - 1][0] + t * (pts[i][0] - pts[i - 1][0]),
                        pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1]),
                    )
                    break
                }
            }
            ctx.stroke()

            // Animated dot at the tip of the line
            const ti = Math.min(Math.floor(maxI), pts.length - 2)
            const tt = Math.max(0, maxI - ti)
            const tx = pts[ti][0] + tt * (pts[ti + 1][0] - pts[ti][0])
            const ty = pts[ti][1] + tt * (pts[ti + 1][1] - pts[ti][1])

            // Outer pulse ring
            const pulse = 4 + Math.sin((frame / TOTAL) * Math.PI * 12) * 2.5
            ctx.beginPath()
            ctx.arc(tx, ty, pulse, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(255, 122, 72, 0.28)"
            ctx.fill()

            // Solid dot
            ctx.beginPath()
            ctx.arc(tx, ty, 3.5, 0, Math.PI * 2)
            ctx.fillStyle = "#ff7a48"
            ctx.fill()

            link!.href = canvas.toDataURL("image/png")
            frame++
        }

        const id = setInterval(tick, 42) // ~24 fps
        return () => clearInterval(id)
    }, [])

    return null
}
