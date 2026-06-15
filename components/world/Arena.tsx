"use client"

import { useEffect, useMemo, useRef } from "react"
import { Billboard, Text } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useBlockTextures } from "./useBlockTextures"
import { isPlayerActive, useWorld } from "@/lib/world/store"
import { touchInput } from "@/lib/world/touchInput"
import { ARENA, STATIONS } from "@/lib/world/worldData"

/**
 * Orb Duel arena: a neon dueling pad where the player challenges EPIC-BOT to a
 * first-to-5 projectile fight. Orbs fly on real gravity arcs; the bot strafes,
 * leads its throws at the player and sometimes dodges incoming fire. Designed
 * bot-first so the minigame works with zero concurrent visitors — a real-time
 * second player can replace the bot later without touching the orb physics.
 */

const FONT = "/fonts/Monocraft.ttf"
const ORB_GRAVITY = 12
const PLAYER_THROW_SPEED = 19
const BOT_THROW_SPEED = 13
const THROW_COOLDOWN = 0.5
const MAX_ORBS = 12
const BOT_SPEED = 4.4
const NEON = "#22d3ee"
const PLAYER_ORB_COLOR = "#ff9d5c"

type Orb = { pos: THREE.Vector3; vel: THREE.Vector3; alive: boolean }
const makePool = (): Orb[] =>
  Array.from({ length: MAX_ORBS }, () => ({ pos: new THREE.Vector3(), vel: new THREE.Vector3(), alive: false }))

const emitDuelHit = (who: "player" | "bot") =>
  window.dispatchEvent(new CustomEvent("world-duel-hit", { detail: { who } }))

function Label({ children, position, size = 0.34, color = "#fff", max = 6 }: {
  children: React.ReactNode
  position?: [number, number, number]
  size?: number
  color?: string
  max?: number
}) {
  return (
    <Text position={position} fontSize={size} color={color} font={FONT} anchorX="center" anchorY="middle" maxWidth={max} textAlign="center" outlineWidth={size * 0.06} outlineColor="#1a1a1a">
      {children}
    </Text>
  )
}

export function Arena() {
  const { camera } = useThree()
  const { mat } = useBlockTextures()

  const mats = useMemo(
    () => ({
      dark: mat("dark_planks"),
      log: mat("oak_log_side"),
      neon: new THREE.MeshBasicMaterial({ color: NEON }),
      neonDim: new THREE.MeshBasicMaterial({ color: NEON, transparent: true, opacity: 0.35 }),
    }),
    [mat],
  )

  const botRef = useRef<THREE.Group>(null!)
  const botPos = useRef(new THREE.Vector3(ARENA.cx - 3, 0, ARENA.cz))
  const botTarget = useRef(new THREE.Vector3(ARENA.cx - 3, 0, ARENA.cz))
  const botRetargetIn = useRef(0)
  const botThrowIn = useRef(2)
  const dodgeUntil = useRef(0)
  const dodgeDir = useRef(new THREE.Vector3())

  const playerOrbs = useRef<Orb[]>(makePool())
  const botOrbs = useRef<Orb[]>(makePool())
  const playerMesh = useRef<THREE.InstancedMesh>(null!)
  const botMesh = useRef<THREE.InstancedMesh>(null!)
  const lastThrow = useRef(-10)
  const throwQueued = useRef(false)
  const prevPhase = useRef("idle")
  const consoleOrb = useRef<THREE.Mesh>(null!)
  const centerRing = useRef<THREE.Mesh>(null!)

  const tmpM = useMemo(() => new THREE.Matrix4(), [])
  const tmpV = useMemo(() => new THREE.Vector3(), [])
  const tmpQ = useMemo(() => new THREE.Quaternion(), [])
  const ONE = useMemo(() => new THREE.Vector3(1, 1, 1), [])
  const ZERO = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  const duelStation = useMemo(() => STATIONS.find((s) => s.id === "duel")!, [])

  // Desktop throw: left click mid-duel (pointer-locked or drag-look fallback).
  // Touch uses its own button.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const s = useWorld.getState()
      if (s.touch || !isPlayerActive(s) || s.activePanel || s.duel.phase !== "playing") return
      const el = e.target as HTMLElement | null
      if (el?.closest?.("button, a, input, .mc-panel, .mc-overlay, .mc-hotbar")) return
      throwQueued.current = true
    }
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const t = state.clock.elapsedTime
    const s = useWorld.getState()
    const phase = s.duel.phase
    const clock = t

    // Ambient animation regardless of duel state.
    if (consoleOrb.current) {
      consoleOrb.current.position.y = 1.7 + Math.sin(t * 2) * 0.12
      consoleOrb.current.rotation.y = t * 1.4
    }
    if (centerRing.current) centerRing.current.rotation.z = t * 0.4

    // Reset the field whenever a duel (re)starts or ends.
    if (phase !== prevPhase.current) {
      if (phase === "countdown" || phase === "idle") {
        for (const o of playerOrbs.current) o.alive = false
        for (const o of botOrbs.current) o.alive = false
        botPos.current.set(ARENA.cx - 3, 0, ARENA.cz)
        botThrowIn.current = 1.6
      }
      prevPhase.current = phase
    }

    if (phase === "countdown" && Date.now() >= s.duel.countdownEnd) s.setDuelPhase("playing")

    const active = isPlayerActive(s) && !s.activePanel

    if (phase === "playing" && active) {
      // Forfeit quietly if the player wanders far from the arena.
      const offX = camera.position.x - ARENA.cx
      const offZ = camera.position.z - ARENA.cz
      if (Math.hypot(offX, offZ) > 18) s.endDuel()

      // --- Bot movement: strafe between random arena points, dash to dodge.
      botRetargetIn.current -= dt
      const distToTarget = botPos.current.distanceTo(botTarget.current)
      if (botRetargetIn.current <= 0 || distToTarget < 0.4) {
        botTarget.current.set(
          ARENA.x0 + 1.5 + Math.random() * (ARENA.x1 - ARENA.x0 - 6),
          0,
          ARENA.z0 + 1.5 + Math.random() * (ARENA.z1 - ARENA.z0 - 3),
        )
        botRetargetIn.current = 0.9 + Math.random() * 1.2
      }
      const speed = clock < dodgeUntil.current ? 9 : BOT_SPEED
      const dir = clock < dodgeUntil.current
        ? dodgeDir.current
        : tmpV.copy(botTarget.current).sub(botPos.current).setY(0).normalize()
      botPos.current.addScaledVector(dir, speed * dt)
      botPos.current.x = Math.min(Math.max(botPos.current.x, ARENA.x0 + 1), ARENA.x1 - 1)
      botPos.current.z = Math.min(Math.max(botPos.current.z, ARENA.z0 + 1), ARENA.z1 - 1)

      // --- Bot throws: ballistic solve onto the player's position with jitter.
      botThrowIn.current -= dt
      if (botThrowIn.current <= 0) {
        botThrowIn.current = 1.2 + Math.random() * 0.9
        const orb = botOrbs.current.find((o) => !o.alive)
        if (orb) {
          const from = tmpV.set(botPos.current.x, 1.5, botPos.current.z)
          const target = camera.position.clone()
          target.x += (Math.random() - 0.5) * 1.0
          target.y += (Math.random() - 0.5) * 0.6 - 0.3
          target.z += (Math.random() - 0.5) * 1.0
          const d = target.sub(from)
          const dxz = Math.hypot(d.x, d.z)
          const T = Math.min(Math.max(dxz / BOT_THROW_SPEED, 0.45), 1.3)
          orb.pos.copy(from)
          orb.vel.set(d.x / T, d.y / T + 0.5 * ORB_GRAVITY * T, d.z / T)
          orb.alive = true
        }
      }

      // --- Player throws (mouse queued, or touch button).
      if (touchInput.throwOrb) {
        touchInput.throwOrb = false
        throwQueued.current = true
      }
      if (throwQueued.current) {
        throwQueued.current = false
        if (clock - lastThrow.current > THROW_COOLDOWN) {
          const orb = playerOrbs.current.find((o) => !o.alive)
          if (orb) {
            lastThrow.current = clock
            camera.getWorldDirection(tmpV)
            orb.pos.copy(camera.position).addScaledVector(tmpV, 0.6)
            orb.pos.y -= 0.15
            orb.vel.copy(tmpV).multiplyScalar(PLAYER_THROW_SPEED)
            orb.vel.y += 1.4
            orb.alive = true
            // The bot sees the throw coming and sometimes dashes sideways.
            if (Math.random() < 0.45) {
              dodgeDir.current.set(tmpV.z, 0, -tmpV.x).normalize()
              if (Math.random() < 0.5) dodgeDir.current.multiplyScalar(-1)
              dodgeUntil.current = clock + 0.32
            }
          }
        }
      }
    } else {
      throwQueued.current = false
      touchInput.throwOrb = false
    }

    // --- Orb physics + hit detection (frozen while paused / in a panel).
    if (active && phase === "playing") {
      for (const o of botOrbs.current) {
        if (!o.alive) continue
        o.vel.y -= ORB_GRAVITY * dt
        o.pos.addScaledVector(o.vel, dt)
        if (o.pos.y < 0.12) { o.alive = false; continue }
        const dx = o.pos.x - camera.position.x
        const dz = o.pos.z - camera.position.z
        if (Math.hypot(dx, dz) < 0.55 && o.pos.y < camera.position.y + 0.6) {
          o.alive = false
          s.scoreDuel("bot")
          emitDuelHit("player")
        }
      }
      for (const o of playerOrbs.current) {
        if (!o.alive) continue
        o.vel.y -= ORB_GRAVITY * dt
        o.pos.addScaledVector(o.vel, dt)
        if (o.pos.y < 0.12) { o.alive = false; continue }
        tmpV.set(botPos.current.x, 1.0, botPos.current.z)
        if (o.pos.distanceTo(tmpV) < 1.05) {
          o.alive = false
          s.scoreDuel("player")
          emitDuelHit("bot")
        }
      }
    }

    // --- Write orb instance matrices (scale dead orbs to zero).
    const write = (pool: Orb[], mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return
      pool.forEach((o, i) => {
        tmpM.compose(o.alive ? o.pos : ZERO, tmpQ.identity(), o.alive ? ONE : ZERO)
        mesh.setMatrixAt(i, tmpM)
      })
      mesh.instanceMatrix.needsUpdate = true
    }
    write(playerOrbs.current, playerMesh.current)
    write(botOrbs.current, botMesh.current)

    // --- Bot body: position, facing, idle bob.
    if (botRef.current) {
      botRef.current.position.set(botPos.current.x, Math.sin(t * 2.2) * 0.05, botPos.current.z)
      if (phase === "playing" || phase === "countdown") {
        botRef.current.rotation.y = Math.atan2(camera.position.x - botPos.current.x, camera.position.z - botPos.current.z)
      } else {
        botRef.current.rotation.y = Math.sin(t * 0.4) * 0.7 + Math.PI / 2
      }
    }
  })

  // Neon edge strips along the arena perimeter.
  const w = ARENA.x1 - ARENA.x0
  const d = ARENA.z1 - ARENA.z0
  const corners: [number, number][] = [
    [ARENA.x0 + 0.5, ARENA.z0 + 0.5], [ARENA.x1 - 0.5, ARENA.z0 + 0.5],
    [ARENA.x0 + 0.5, ARENA.z1 - 0.5], [ARENA.x1 - 0.5, ARENA.z1 - 0.5],
  ]

  return (
    <group>
      {/* perimeter glow strips */}
      <mesh position={[ARENA.cx, 0.04, ARENA.z0 + 0.1]} material={mats.neon}><boxGeometry args={[w, 0.08, 0.16]} /></mesh>
      <mesh position={[ARENA.cx, 0.04, ARENA.z1 - 0.1]} material={mats.neon}><boxGeometry args={[w, 0.08, 0.16]} /></mesh>
      <mesh position={[ARENA.x0 + 0.1, 0.04, ARENA.cz]} material={mats.neon}><boxGeometry args={[0.16, 0.08, d]} /></mesh>
      <mesh position={[ARENA.x1 - 0.1, 0.04, ARENA.cz]} material={mats.neon}><boxGeometry args={[0.16, 0.08, d]} /></mesh>

      {/* corner pillars with glowing caps */}
      {corners.map((c, i) => (
        <group key={i} position={[c[0], 0, c[1]]}>
          <mesh position={[0, 1.6, 0]} material={mats.dark} castShadow><boxGeometry args={[0.8, 3.2, 0.8]} /></mesh>
          <mesh position={[0, 3.4, 0]} material={mats.neon}><boxGeometry args={[0.9, 0.35, 0.9]} /></mesh>
        </group>
      ))}
      {/* single light over the centre keeps the forward-render light budget low */}
      <pointLight position={[ARENA.cx, 4, ARENA.cz]} color={NEON} intensity={9} distance={20} decay={2} />

      {/* holographic centre ring */}
      <mesh ref={centerRing} position={[ARENA.cx, 0.06, ARENA.cz]} rotation={[-Math.PI / 2, 0, 0]} material={mats.neonDim}>
        <ringGeometry args={[2.4, 2.7, 32]} />
      </mesh>

      {/* duel console (the interactable) */}
      <group position={[duelStation.position[0], 0, duelStation.position[2]]}>
        <mesh position={[0, 0.6, 0]} material={mats.dark} castShadow receiveShadow><boxGeometry args={[1, 1.2, 1]} /></mesh>
        <mesh ref={consoleOrb} position={[0, 1.7, 0]}>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshBasicMaterial color={NEON} wireframe />
        </mesh>
        <Billboard position={[0, 2.7, 0]}>
          <Label size={0.38} color={NEON}>⚔ Orb Arena</Label>
          <Label position={[0, -0.36, 0]} size={0.22} color="#e2e8f0">First to 5 beats EPIC-BOT</Label>
        </Billboard>
      </group>

      {/* EPIC-BOT */}
      <group ref={botRef} position={[ARENA.cx - 3, 0, ARENA.cz]}>
        <mesh position={[0, 1.05, 0]} castShadow><boxGeometry args={[0.54, 0.78, 0.3]} /><meshLambertMaterial color="#1e293b" /></mesh>
        <mesh position={[0, 1.72, 0]} castShadow><boxGeometry args={[0.5, 0.5, 0.5]} /><meshLambertMaterial color="#0f172a" /></mesh>
        {/* visor */}
        <mesh position={[0, 1.74, 0.26]}><boxGeometry args={[0.36, 0.12, 0.03]} /><meshBasicMaterial color={NEON} /></mesh>
        {/* antenna */}
        <mesh position={[0, 2.12, 0]}><boxGeometry args={[0.05, 0.3, 0.05]} /><meshLambertMaterial color="#334155" /></mesh>
        <mesh position={[0, 2.32, 0]}><boxGeometry args={[0.12, 0.12, 0.12]} /><meshBasicMaterial color="#f43f5e" /></mesh>
        {/* legs */}
        <mesh position={[-0.14, 0.45, 0]} castShadow><boxGeometry args={[0.2, 0.5, 0.22]} /><meshLambertMaterial color="#334155" /></mesh>
        <mesh position={[0.14, 0.45, 0]} castShadow><boxGeometry args={[0.2, 0.5, 0.22]} /><meshLambertMaterial color="#334155" /></mesh>
        {/* arms */}
        <mesh position={[0, 1.18, 0]} castShadow><boxGeometry args={[0.92, 0.24, 0.26]} /><meshLambertMaterial color="#1e293b" /></mesh>
        <Billboard position={[0, 2.85, 0]}>
          <Label size={0.32} color={NEON}>EPIC-BOT</Label>
        </Billboard>
      </group>

      {/* orb pools */}
      <instancedMesh ref={playerMesh} args={[undefined, undefined, MAX_ORBS]} frustumCulled={false}>
        <sphereGeometry args={[0.17, 12, 12]} />
        <meshBasicMaterial color={PLAYER_ORB_COLOR} />
      </instancedMesh>
      <instancedMesh ref={botMesh} args={[undefined, undefined, MAX_ORBS]} frustumCulled={false}>
        <sphereGeometry args={[0.17, 12, 12]} />
        <meshBasicMaterial color={NEON} />
      </instancedMesh>
    </group>
  )
}
