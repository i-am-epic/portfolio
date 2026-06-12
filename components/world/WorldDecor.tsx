"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useBlockTextures } from "./useBlockTextures"

// ---------- shared materials ----------
function useDecorMats() {
  const { mat } = useBlockTextures()
  return useMemo(
    () => ({
      cobble: mat("cobblestone"),
      planks: mat("oak_planks"),
      dark: mat("dark_planks"),
      log: mat("oak_log_side"),
      glass: mat("glass", { transparent: true }),
      glow: mat("glowstone", { emissive: 0xffd27f, emissiveIntensity: 1.4 }),
    }),
    [mat],
  )
}
type DMats = ReturnType<typeof useDecorMats>

// ---------- drifting clouds ----------
function Clouds() {
  const ref = useRef<THREE.Group>(null!)
  const clouds = useMemo(
    () =>
      Array.from({ length: 9 }, () => ({
        x: (Math.random() - 0.5) * 120,
        y: 26 + Math.random() * 12,
        z: (Math.random() - 0.5) * 120,
        s: 6 + Math.random() * 10,
        sp: 0.4 + Math.random() * 0.5,
      })),
    [],
  )
  useFrame((_, dt) => {
    ref.current?.children.forEach((c, i) => {
      c.position.x += clouds[i].sp * dt
      if (c.position.x > 70) c.position.x = -70
    })
  })
  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]}>
          <boxGeometry args={[c.s, 1.4, c.s * 0.6]} />
          <meshLambertMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- lamp post with flickering light ----------
// `lit` adds a real PointLight; the rest glow via the emissive cap only.
// Forward rendering pays per-fragment for every light, so the scene keeps a
// small light budget (~6 point lights total) and fakes the others.
function Lamp({ pos, mats, lit = false }: { pos: [number, number, number]; mats: DMats; lit?: boolean }) {
  const light = useRef<THREE.PointLight>(null!)
  useFrame((s) => {
    if (light.current) light.current.intensity = 6 + Math.sin(s.clock.elapsedTime * 12 + pos[0]) * 1.6
  })
  return (
    <group position={pos}>
      <mesh position={[0, 1.2, 0]} material={mats.log} castShadow><boxGeometry args={[0.22, 2.4, 0.22]} /></mesh>
      <mesh position={[0, 2.5, 0]} material={mats.glow} castShadow><boxGeometry args={[0.45, 0.45, 0.45]} /></mesh>
      {lit && <pointLight ref={light} position={[0, 2.5, 0]} color="#ffcf8a" intensity={6} distance={11} decay={2} />}
    </group>
  )
}

// ---------- fence run ----------
function Fence({ from, to, mats }: { from: [number, number]; to: [number, number]; mats: DMats }) {
  const posts = useMemo(() => {
    const out: [number, number][] = []
    const dx = to[0] - from[0], dz = to[1] - from[1]
    const len = Math.hypot(dx, dz)
    const n = Math.max(1, Math.round(len))
    for (let i = 0; i <= n; i++) out.push([from[0] + (dx * i) / n, from[1] + (dz * i) / n])
    return out
  }, [from, to])
  return (
    <group>
      {posts.map((p, i) => (
        <group key={i} position={[p[0], 0, p[1]]}>
          <mesh position={[0, 0.5, 0]} material={mats.log} castShadow><boxGeometry args={[0.16, 1, 0.16]} /></mesh>
          <mesh position={[0, 0.75, 0]} material={mats.log}><boxGeometry args={[0.16, 0.12, 1.05]} /></mesh>
          <mesh position={[0, 0.4, 0]} material={mats.log}><boxGeometry args={[0.16, 0.12, 1.05]} /></mesh>
        </group>
      ))}
    </group>
  )
}

// ---------- flowers ----------
function Flowers() {
  const flowers = useMemo(() => {
    const colors = ["#ef4444", "#f59e0b", "#ec4899", "#a855f7", "#ffffff"]
    // Keep flowers off the built-up zones (orb arena west, sim lab east).
    const blocked = (x: number, z: number) =>
      (x >= -30 && x <= -16 && z >= -20 && z <= -6) || (x >= 15 && x <= 29 && z >= 0 && z <= 12)
    const out: { x: number; z: number; c: string }[] = []
    while (out.length < 30) {
      const side = Math.random() < 0.5 ? -1 : 1
      const x = side * (15 + Math.random() * 15)
      const z = -28 + Math.random() * 58
      if (blocked(x, z)) continue
      out.push({ x, z, c: colors[Math.floor(Math.random() * colors.length)] })
    }
    return out
  }, [])
  return (
    <group>
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, 0, f.z]}>
          <mesh position={[0, 0.18, 0]}><boxGeometry args={[0.06, 0.36, 0.06]} /><meshLambertMaterial color="#3f8f3f" /></mesh>
          <mesh position={[0, 0.42, 0]}><boxGeometry args={[0.2, 0.2, 0.2]} /><meshLambertMaterial color={f.c} /></mesh>
        </group>
      ))}
    </group>
  )
}

// ---------- cottage ----------
function Cottage({ mats }: { mats: DMats }) {
  // footprint x[-24,-18] z[14,20]; door gap on front (z=14) around x -22..-20
  const wall = (key: string, pos: [number, number, number], size: [number, number, number]) => (
    <mesh key={key} position={pos} material={mats.cobble} castShadow receiveShadow><boxGeometry args={size} /></mesh>
  )
  return (
    <group>
      {/* floor */}
      <mesh position={[-21, 0.06, 17]} material={mats.planks} receiveShadow><boxGeometry args={[6, 0.12, 6]} /></mesh>
      {/* walls */}
      {wall("back", [-21, 1.5, 19.75], [6, 3, 0.5])}
      {wall("left", [-23.75, 1.5, 17], [0.5, 3, 6])}
      {wall("right", [-18.25, 1.5, 17], [0.5, 3, 6])}
      {wall("fL", [-23, 1.5, 14.25], [2, 3, 0.5])}
      {wall("fR", [-19, 1.5, 14.25], [2, 3, 0.5])}
      {wall("lintel", [-21, 2.7, 14.25], [2, 0.6, 0.5])}
      {/* glass windows */}
      <mesh position={[-23.7, 1.7, 16]} material={mats.glass}><boxGeometry args={[0.3, 1, 1.4]} /></mesh>
      <mesh position={[-18.3, 1.7, 18]} material={mats.glass}><boxGeometry args={[0.3, 1, 1.4]} /></mesh>
      {/* gable roof */}
      <mesh position={[-22.5, 3.6, 17]} rotation={[0, 0, 0.62]} material={mats.dark} castShadow><boxGeometry args={[0.4, 4.2, 6.6]} /></mesh>
      <mesh position={[-19.5, 3.6, 17]} rotation={[0, 0, -0.62]} material={mats.dark} castShadow><boxGeometry args={[0.4, 4.2, 6.6]} /></mesh>
      {/* lantern over door */}
      <mesh position={[-21, 3.0, 13.95]} material={mats.glow}><boxGeometry args={[0.3, 0.3, 0.3]} /></mesh>
      <pointLight position={[-21, 2.6, 13.6]} color="#ffcf8a" intensity={4} distance={8} decay={2} />
    </group>
  )
}

// ---------- fireflies ----------
function Fireflies() {
  const ref = useRef<THREE.Points>(null!)
  const { geom, base } = useMemo(() => {
    const n = 90
    const pos = new Float32Array(n * 3)
    const base = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * 60
      const y = 0.6 + Math.random() * 4
      const z = (Math.random() - 0.5) * 60
      pos.set([x, y, z], i * 3)
      base.set([x, y, z], i * 3)
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    return { geom, base }
  }, [])
  useFrame((s) => {
    const t = s.clock.elapsedTime
    const arr = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = base[i] + Math.sin(t * 0.6 + i) * 1.2
      arr[i + 1] = base[i + 1] + Math.sin(t * 1.3 + i) * 0.5
      arr[i + 2] = base[i + 2] + Math.cos(t * 0.5 + i) * 1.2
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color="#ffe9a8" size={0.18} transparent opacity={0.85} sizeAttenuation />
    </points>
  )
}

// ---------- wandering mob (chicken / pig) ----------
function Critter({ color, belly, region, speed }: { color: string; belly: string; region: [number, number, number, number]; speed: number }) {
  const ref = useRef<THREE.Group>(null!)
  const target = useRef(new THREE.Vector3())
  const init = useRef(false)
  const rnd = () => new THREE.Vector3(region[0] + Math.random() * (region[1] - region[0]), 0, region[2] + Math.random() * (region[3] - region[2]))
  useFrame((s, dt) => {
    const o = ref.current
    if (!o) return
    if (!init.current) { o.position.copy(rnd()); target.current.copy(rnd()); init.current = true }
    const d = target.current.clone().sub(o.position); d.y = 0
    if (d.length() < 0.5) target.current.copy(rnd())
    else {
      d.normalize()
      o.position.addScaledVector(d, speed * dt)
      o.rotation.y = Math.atan2(d.x, d.z)
    }
    o.position.y = Math.abs(Math.sin(s.clock.elapsedTime * 8)) * 0.08
  })
  return (
    <group ref={ref}>
      <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[0.5, 0.45, 0.7]} /><meshLambertMaterial color={color} /></mesh>
      <mesh position={[0, 0.32, 0]}><boxGeometry args={[0.52, 0.25, 0.72]} /><meshLambertMaterial color={belly} /></mesh>
      <mesh position={[0, 0.7, 0.36]} castShadow><boxGeometry args={[0.34, 0.34, 0.34]} /><meshLambertMaterial color={color} /></mesh>
      <mesh position={[0, 0.66, 0.55]}><boxGeometry args={[0.12, 0.1, 0.1]} /><meshLambertMaterial color="#f59e0b" /></mesh>
      {/* legs */}
      <mesh position={[-0.14, 0.1, -0.1]}><boxGeometry args={[0.1, 0.2, 0.1]} /><meshLambertMaterial color="#f59e0b" /></mesh>
      <mesh position={[0.14, 0.1, -0.1]}><boxGeometry args={[0.1, 0.2, 0.1]} /><meshLambertMaterial color="#f59e0b" /></mesh>
    </group>
  )
}

// ---------- bouncing slime (light physics) ----------
function Slime({ start, region }: { start: [number, number]; region: [number, number, number, number] }) {
  const ref = useRef<THREE.Group>(null!)
  const vy = useRef(0)
  const y = useRef(0)
  const dir = useRef(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize())
  useFrame((_, dtRaw) => {
    const o = ref.current
    if (!o) return
    const dt = Math.min(dtRaw, 0.05)
    // gravity + bounce
    vy.current -= 16 * dt
    y.current += vy.current * dt
    if (y.current <= 0) { y.current = 0; vy.current = 5.2 } // perpetual bounce
    // squash/stretch from vertical speed
    const sq = 1 - Math.min(0.35, Math.max(-0.2, vy.current * 0.04))
    o.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq))
    // hop forward only while airborne
    if (y.current > 0.05) o.position.addScaledVector(dir.current, 1.4 * dt)
    o.position.y = y.current
    // bounce off region bounds
    if (o.position.x < region[0] || o.position.x > region[1]) dir.current.x *= -1
    if (o.position.z < region[2] || o.position.z > region[3]) dir.current.z *= -1
    o.position.x = Math.min(Math.max(o.position.x, region[0]), region[1])
    o.position.z = Math.min(Math.max(o.position.z, region[2]), region[3])
  })
  return (
    <group ref={ref} position={[start[0], 0, start[1]]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshLambertMaterial color="#5fbf57" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.18, 0.5, 0.41]}><boxGeometry args={[0.1, 0.1, 0.02]} /><meshBasicMaterial color="#15301a" /></mesh>
      <mesh position={[0.18, 0.5, 0.41]}><boxGeometry args={[0.1, 0.1, 0.02]} /><meshBasicMaterial color="#15301a" /></mesh>
    </group>
  )
}

export function WorldDecor() {
  const mats = useDecorMats()
  return (
    <group>
      <Clouds />
      <Fireflies />
      <Cottage mats={mats} />

      <Lamp pos={[-3, 0, 6]} mats={mats} lit />
      <Lamp pos={[3, 0, 6]} mats={mats} lit />
      <Lamp pos={[-3, 0, -12]} mats={mats} />
      <Lamp pos={[3, 0, -12]} mats={mats} />
      <Lamp pos={[-9, 0, 27]} mats={mats} />
      <Lamp pos={[9, 0, 27]} mats={mats} />

      {/* garden fence around the cottage */}
      <Fence from={[-25, 13]} to={[-25, 21]} mats={mats} />
      <Fence from={[-25, 21]} to={[-17, 21]} mats={mats} />
      <Fence from={[-17, 13]} to={[-17, 21]} mats={mats} />

      <Flowers />

      {/* mobs wandering the plaza */}
      <Critter color="#f8fafc" belly="#e2e8f0" region={[-9, 9, 11, 26]} speed={1.3} />
      <Critter color="#f8fafc" belly="#e2e8f0" region={[-9, 9, 11, 26]} speed={1.5} />
      <Critter color="#f0a9c0" belly="#e58aa6" region={[-9, 9, 11, 26]} speed={1.1} />
      <Critter color="#f0a9c0" belly="#e58aa6" region={[-9, 9, 11, 26]} speed={1.0} />

      {/* slimes near the hall */}
      <Slime start={[-7, 2]} region={[-12, 12, -10, 7]} />
      <Slime start={[7, -4]} region={[-12, 12, -10, 7]} />
    </group>
  )
}
