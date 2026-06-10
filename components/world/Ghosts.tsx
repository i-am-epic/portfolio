"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useWorld } from "@/lib/world/store"
import { PLAYER_EYE } from "@/lib/world/worldData"

/**
 * Async multiplayer: every visit records the player's walk and replays recent
 * visitors as translucent "ghosts", so the island always feels inhabited even
 * though real-time overlap between portfolio visitors is rare.
 */

type Trail = { name: string; path: [number, number, number][]; date: number }

const SAMPLE_MS = 600
const MAX_SAMPLES = 240
const MAX_GHOSTS = 6
const NAME_KEY = "world:player-name"

// --- Recorder ----------------------------------------------------------------

function useTrailRecorder() {
  const { camera } = useThree()
  const samples = useRef<[number, number, number][]>([])
  const sent = useRef(false)
  const acc = useRef(0)

  useFrame((_, dt) => {
    const s = useWorld.getState()
    if (!s.started || s.activePanel) return
    acc.current += dt
    if (acc.current < SAMPLE_MS / 1000) return
    acc.current = 0
    if (samples.current.length >= MAX_SAMPLES) return
    const last = samples.current[samples.current.length - 1]
    const x = camera.position.x
    const z = camera.position.z
    if (last && Math.hypot(x - last[0], z - last[1]) < 0.2) return
    const e = new THREE.Euler(0, 0, 0, "YXZ").setFromQuaternion(camera.quaternion)
    samples.current.push([x, z, e.y])
  })

  useEffect(() => {
    const submit = () => {
      if (sent.current || samples.current.length < 12) return
      sent.current = true
      let name = "Visitor"
      try { name = window.localStorage.getItem(NAME_KEY) || "Visitor" } catch {}
      const body = JSON.stringify({ name, path: samples.current })
      try {
        if (!navigator.sendBeacon?.("/api/ghosts", new Blob([body], { type: "application/json" }))) {
          void fetch("/api/ghosts", { method: "POST", body, keepalive: true })
        }
      } catch {}
    }
    const onHide = () => { if (document.visibilityState === "hidden") submit() }
    document.addEventListener("visibilitychange", onHide)
    window.addEventListener("pagehide", submit)
    return () => {
      document.removeEventListener("visibilitychange", onHide)
      window.removeEventListener("pagehide", submit)
      submit()
    }
  }, [])
}

// --- Renderer ----------------------------------------------------------------

function makeNameSprite(name: string): THREE.Sprite {
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext("2d")!
  ctx.font = "bold 34px monospace"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = "rgba(0,0,0,0.45)"
  const w = Math.min(240, ctx.measureText(name).width + 24)
  ctx.fillRect(128 - w / 2, 8, w, 48)
  ctx.fillStyle = "#dbeafe"
  ctx.fillText(name, 128, 34)
  const tex = new THREE.CanvasTexture(canvas)
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.85, depthWrite: false }))
  sprite.scale.set(1.8, 0.45, 1)
  return sprite
}

const GHOST_MAT = new THREE.MeshStandardMaterial({
  color: "#8fd3ff",
  transparent: true,
  opacity: 0.32,
  depthWrite: false,
  roughness: 0.9,
})

function Ghost({ trail, offset }: { trail: Trail; offset: number }) {
  const group = useRef<THREE.Group>(null!)
  const legL = useRef<THREE.Mesh>(null!)
  const legR = useRef<THREE.Mesh>(null!)

  const sprite = useMemo(() => makeNameSprite(trail.name), [trail.name])
  useEffect(() => () => {
    sprite.material.map?.dispose()
    sprite.material.dispose()
  }, [sprite])

  const duration = (trail.path.length - 1) * (SAMPLE_MS / 1000)

  useFrame(({ clock }) => {
    const path = trail.path
    if (path.length < 2 || !group.current) return
    const t = (clock.elapsedTime + offset) % duration
    const f = t / (SAMPLE_MS / 1000)
    const i = Math.min(Math.floor(f), path.length - 2)
    const frac = f - i
    const [x0, z0, y0] = path[i]
    const [x1, z1, y1] = path[i + 1]
    const x = x0 + (x1 - x0) * frac
    const z = z0 + (z1 - z0) * frac
    // Shortest-arc yaw interpolation.
    let dy = y1 - y0
    if (dy > Math.PI) dy -= Math.PI * 2
    if (dy < -Math.PI) dy += Math.PI * 2
    group.current.position.set(x, 0, z)
    group.current.rotation.y = y0 + dy * frac

    const moving = Math.hypot(x1 - x0, z1 - z0) > 0.05
    const swing = moving ? Math.sin(clock.elapsedTime * 7) * 0.45 : 0
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
  })

  return (
    <group ref={group}>
      {/* head */}
      <mesh position={[0, PLAYER_EYE - 0.05, 0]} material={GHOST_MAT}>
        <boxGeometry args={[0.46, 0.46, 0.46]} />
      </mesh>
      {/* body */}
      <mesh position={[0, 1.05, 0]} material={GHOST_MAT}>
        <boxGeometry args={[0.5, 0.72, 0.26]} />
      </mesh>
      {/* legs */}
      <mesh ref={legL} position={[-0.13, 0.69, 0]} material={GHOST_MAT}>
        <boxGeometry args={[0.2, 0.66, 0.2]} />
      </mesh>
      <mesh ref={legR} position={[0.13, 0.69, 0]} material={GHOST_MAT}>
        <boxGeometry args={[0.2, 0.66, 0.2]} />
      </mesh>
      <primitive object={sprite} position={[0, 2.15, 0]} />
    </group>
  )
}

export function Ghosts() {
  useTrailRecorder()
  const [trails, setTrails] = useState<Trail[]>([])

  useEffect(() => {
    let cancelled = false
    fetch("/api/ghosts", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { ghosts?: Trail[] }) => {
        if (cancelled || !Array.isArray(data.ghosts)) return
        const valid = data.ghosts.filter((g) => Array.isArray(g.path) && g.path.length >= 12)
        setTrails(valid.slice(0, MAX_GHOSTS))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <>
      {trails.map((t, i) => (
        <Ghost key={t.date + i} trail={t} offset={i * 7.3} />
      ))}
    </>
  )
}
