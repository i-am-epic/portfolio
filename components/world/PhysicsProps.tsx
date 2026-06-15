"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { isPlayerActive, useWorld } from "@/lib/world/store"
import { useAchievements } from "@/lib/world/achievements"
import { COLLIDERS, WORLD_BOUNDS } from "@/lib/world/worldData"

/**
 * Bounce cubes: glowing physics props scattered around the plaza. Walk into
 * one to kick it, or click while looking at one to punch it across the map.
 * Full rigid-ish body sim: gravity, restitution, ground friction, collisions
 * against the world's AABB colliders, cube-vs-cube impulses and tumbling.
 */

const SIZE = 0.66
const HALF = SIZE / 2
const GRAVITY = 20
const RESTITUTION = 0.55

const SPAWNS: { x: number; z: number; c: string }[] = [
  { x: 4, z: 20, c: "#34d399" },
  { x: -4, z: 22, c: "#fb923c" },
  { x: 2, z: 15, c: "#60a5fa" },
  { x: -7, z: 19, c: "#c084fc" },
  { x: 6, z: 23, c: "#f472b6" },
  { x: -2, z: 11, c: "#facc15" },
]

type Body = {
  pos: THREE.Vector3
  vel: THREE.Vector3
  angVel: THREE.Vector3
  kickCooldown: number
}

export function PhysicsProps() {
  const { camera } = useThree()
  const meshes = useRef<(THREE.Mesh | null)[]>([])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const punchQueued = useRef(false)

  const bodies = useRef<Body[]>(
    SPAWNS.map((s) => ({
      pos: new THREE.Vector3(s.x, HALF, s.z),
      vel: new THREE.Vector3(),
      angVel: new THREE.Vector3(),
      kickCooldown: 0,
    })),
  )

  // Click-to-punch: raycast from the crosshair on desktop (pointer-locked or
  // drag-look fallback).
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const s = useWorld.getState()
      if (s.touch || !isPlayerActive(s) || s.activePanel) return
      const el = e.target as HTMLElement | null
      if (el?.closest?.("button, a, input, .mc-panel, .mc-overlay, .mc-hotbar")) return
      punchQueued.current = true
    }
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const s = useWorld.getState()
    const active = isPlayerActive(s) && !s.activePanel
    const bs = bodies.current

    if (punchQueued.current) {
      punchQueued.current = false
      if (active) {
        camera.getWorldDirection(tmp)
        raycaster.set(camera.position, tmp)
        raycaster.far = 4.5
        const targets = meshes.current.filter(Boolean) as THREE.Mesh[]
        const hit = raycaster.intersectObjects(targets, false)[0]
        if (hit) {
          const idx = meshes.current.indexOf(hit.object as THREE.Mesh)
          if (idx >= 0) {
            const b = bs[idx]
            b.vel.copy(tmp).multiplyScalar(13)
            b.vel.y += 5.5
            b.angVel.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10)
            useAchievements.getState().award("boing")
          }
        }
      }
    }

    for (let i = 0; i < bs.length; i++) {
      const b = bs[i]
      b.kickCooldown = Math.max(0, b.kickCooldown - dt)

      // Walk-into kick (works on touch too).
      if (active && b.kickCooldown === 0) {
        const dx = b.pos.x - camera.position.x
        const dz = b.pos.z - camera.position.z
        const dist = Math.hypot(dx, dz)
        if (dist < 0.95 && b.pos.y < 1.6) {
          const inv = dist > 0.01 ? 1 / dist : 1
          b.vel.x += dx * inv * 5.5
          b.vel.z += dz * inv * 5.5
          b.vel.y = Math.max(b.vel.y, 4.2)
          b.angVel.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8)
          b.kickCooldown = 0.4
          useAchievements.getState().award("boing")
        }
      }

      // Integrate.
      b.vel.y -= GRAVITY * dt
      b.pos.addScaledVector(b.vel, dt)

      // Ground bounce + friction.
      if (b.pos.y < HALF) {
        b.pos.y = HALF
        if (b.vel.y < -1.2) {
          b.vel.y *= -RESTITUTION
        } else {
          b.vel.y = 0
        }
        const f = Math.max(0, 1 - 2.2 * dt)
        b.vel.x *= f
        b.vel.z *= f
      }

      // Island bounds.
      if (b.pos.x < WORLD_BOUNDS.x0 + HALF) { b.pos.x = WORLD_BOUNDS.x0 + HALF; b.vel.x *= -RESTITUTION }
      if (b.pos.x > WORLD_BOUNDS.x1 - HALF) { b.pos.x = WORLD_BOUNDS.x1 - HALF; b.vel.x *= -RESTITUTION }
      if (b.pos.z < WORLD_BOUNDS.z0 + HALF) { b.pos.z = WORLD_BOUNDS.z0 + HALF; b.vel.z *= -RESTITUTION }
      if (b.pos.z > WORLD_BOUNDS.z1 - HALF) { b.pos.z = WORLD_BOUNDS.z1 - HALF; b.vel.z *= -RESTITUTION }

      // World colliders (treated as full-height walls, like the player).
      if (b.pos.y < 3) {
        for (const c of COLLIDERS) {
          const minX = c.x0 - HALF, maxX = c.x1 + HALF, minZ = c.z0 - HALF, maxZ = c.z1 + HALF
          if (b.pos.x > minX && b.pos.x < maxX && b.pos.z > minZ && b.pos.z < maxZ) {
            const left = b.pos.x - minX, right = maxX - b.pos.x, top = b.pos.z - minZ, bot = maxZ - b.pos.z
            const m = Math.min(left, right, top, bot)
            if (m === left) { b.pos.x = minX; b.vel.x = -Math.abs(b.vel.x) * RESTITUTION }
            else if (m === right) { b.pos.x = maxX; b.vel.x = Math.abs(b.vel.x) * RESTITUTION }
            else if (m === top) { b.pos.z = minZ; b.vel.z = -Math.abs(b.vel.z) * RESTITUTION }
            else { b.pos.z = maxZ; b.vel.z = Math.abs(b.vel.z) * RESTITUTION }
          }
        }
      }

      // Cube-vs-cube: push apart and trade velocity along the contact normal.
      for (let j = i + 1; j < bs.length; j++) {
        const o = bs[j]
        tmp.copy(b.pos).sub(o.pos)
        const d = tmp.length()
        if (d > 0.001 && d < SIZE) {
          tmp.multiplyScalar(1 / d)
          const push = (SIZE - d) / 2
          b.pos.addScaledVector(tmp, push)
          o.pos.addScaledVector(tmp, -push)
          const rel = (b.vel.x - o.vel.x) * tmp.x + (b.vel.y - o.vel.y) * tmp.y + (b.vel.z - o.vel.z) * tmp.z
          if (rel < 0) {
            const imp = -rel * 0.9
            b.vel.addScaledVector(tmp, imp)
            o.vel.addScaledVector(tmp, -imp)
          }
        }
      }

      // Tumble + damping.
      const damp = Math.max(0, 1 - 1.6 * dt)
      b.angVel.multiplyScalar(damp)

      const mesh = meshes.current[i]
      if (mesh) {
        mesh.position.copy(b.pos)
        mesh.rotation.x += b.angVel.x * dt
        mesh.rotation.y += b.angVel.y * dt
        mesh.rotation.z += b.angVel.z * dt
      }
    }
  })

  return (
    <group>
      {SPAWNS.map((sp, i) => (
        <mesh
          key={i}
          ref={(el) => { meshes.current[i] = el }}
          position={[sp.x, HALF, sp.z]}
          castShadow
        >
          <boxGeometry args={[SIZE, SIZE, SIZE]} />
          <meshLambertMaterial color={sp.c} emissive={sp.c} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  )
}
