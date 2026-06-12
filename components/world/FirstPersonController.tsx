"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { PointerLockControls } from "@react-three/drei"
import * as THREE from "three"
import { isPlayerActive, useWorld } from "@/lib/world/store"
import { useAchievements } from "@/lib/world/achievements"
import { consumeLook, touchInput } from "@/lib/world/touchInput"
import {
  COLLIDERS,
  INTERACTABLES,
  PLAYER_EYE,
  PLAYER_RADIUS,
  SPAWN,
  WORLD_BOUNDS,
} from "@/lib/world/worldData"

const WALK = 5.2
const SPRINT = 8.4
const GRAVITY = 22
const JUMP = 7.5
const LOOK_SPEED = 0.0042
const MAX_PITCH = 1.45

type Keys = Record<string, boolean>

export function FirstPersonController() {
  const { camera, scene, gl } = useThree()
  const touch = useWorld((s) => s.touch)
  const lockFallback = useWorld((s) => s.lockFallback)
  const controls = useRef<any>(null)
  const everLocked = useRef(false)
  const keys = useRef<Keys>({})
  const velY = useRef(0)
  const grounded = useRef(true)
  const lastCoordPush = useRef(0)
  // Manual look state (touch mode only — pointer lock handles desktop).
  const yaw = useRef(SPAWN.yaw)
  const pitch = useRef(0)
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, "YXZ"), [])

  const forward = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const move = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  // Spawn placement.
  useEffect(() => {
    camera.position.set(SPAWN.position[0], SPAWN.position[1], SPAWN.position[2])
    camera.lookAt(0, PLAYER_EYE, 0)
    const e = new THREE.Euler(0, 0, 0, "YXZ").setFromQuaternion(camera.quaternion)
    yaw.current = e.y
    pitch.current = e.x
    if (process.env.NODE_ENV !== "production") {
      const w = window as unknown as { __cam?: THREE.Camera; __scene?: THREE.Scene; __gl?: THREE.WebGLRenderer }
      w.__cam = camera
      w.__scene = scene
      w.__gl = gl
    }
  }, [camera, scene, gl])

  // Keyboard.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true
      if (e.code === "KeyE") {
        const s = useWorld.getState()
        if (isPlayerActive(s) && s.target && !s.activePanel) s.openPanel(s.target)
      }
      if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(e.code)) e.preventDefault()
    }
    const upFn = (e: KeyboardEvent) => { keys.current[e.code] = false }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", upFn)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", upFn)
    }
  }, [])

  // Pointer lock can never work in some environments: cross-origin iframes
  // without allow="pointer-lock", sandboxed embeds, and several in-app
  // webviews. Detect those up front and switch to drag-look immediately, so
  // drei's controls never mount and never log "Unable to use Pointer Lock".
  useEffect(() => {
    if (touch) return
    let blocked = false
    try {
      if (typeof document.body.requestPointerLock !== "function") blocked = true
      const fp = (document as unknown as { featurePolicy?: { allowsFeature?: (f: string) => boolean } }).featurePolicy
      if (fp?.allowsFeature && !fp.allowsFeature("pointer-lock")) blocked = true
    } catch {
      blocked = true
    }
    if (blocked) useWorld.getState().setLockFallback(true)
  }, [touch])

  // Lock/unlock wiring (desktop pointer lock only). Use the standard
  // pointerlockchange event (robust) instead of the drei controls' own events,
  // and attach the request listener unconditionally — the controls ref is
  // populated asynchronously, so depending on it here would (and did) silently
  // drop the listener and break Resume.
  useEffect(() => {
    if (touch || lockFallback) return
    const onChange = () => {
      const locked = !!document.pointerLockElement
      if (locked) everLocked.current = true
      useWorld.getState().setLocked(locked)
      if (!locked) keys.current = {}
    }
    const onError = () => {
      // If a lock has never succeeded this session, the environment simply
      // doesn't permit it (iframe/webview) — fall back to drag-look instead
      // of retrying forever. If it worked before, this is just Chrome's ~1s
      // re-lock cooldown after Esc: retry on the next click.
      if (!everLocked.current) {
        useWorld.getState().setLockFallback(true)
        return
      }
      const retry = () => { try { controls.current?.lock() } catch {} }
      window.addEventListener("pointerdown", retry, { once: true })
    }
    const onRequest = () => { try { controls.current?.lock() } catch {} }

    document.addEventListener("pointerlockchange", onChange)
    document.addEventListener("pointerlockerror", onError)
    window.addEventListener("world-request-lock", onRequest)
    return () => {
      document.removeEventListener("pointerlockchange", onChange)
      document.removeEventListener("pointerlockerror", onError)
      window.removeEventListener("world-request-lock", onRequest)
    }
  }, [touch, lockFallback])

  // Fallback look: drag the mouse (or pen) when pointer lock is unavailable.
  // Feeds the same accumulator as touch-look, so the frame loop is shared.
  useEffect(() => {
    if (touch || !lockFallback) return
    let dragging = false
    let lastX = 0
    let lastY = 0
    const down = (e: PointerEvent) => {
      const s = useWorld.getState()
      if (!s.started || s.activePanel) return
      const el = e.target as HTMLElement | null
      if (el?.closest?.("button, a, input, textarea, .mc-panel, .mc-overlay, .mc-hotbar, .mc-topright, .mc-quest-chip")) return
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      touchInput.lookDX += e.clientX - lastX
      touchInput.lookDY += e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
    }
    const up = () => { dragging = false }
    window.addEventListener("pointerdown", down)
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    return () => {
      window.removeEventListener("pointerdown", down)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
    }
  }, [touch, lockFallback])

  // Close panel -> nothing; open panel -> release pointer so HTML is usable.
  useEffect(() => {
    if (touch) return
    return useWorld.subscribe((s) => {
      if (s.activePanel && controls.current?.isLocked) controls.current.unlock()
    })
  }, [touch])

  const resolveCollisions = (px: number, pz: number): [number, number] => {
    const r = PLAYER_RADIUS
    for (const c of COLLIDERS) {
      const minX = c.x0 - r, maxX = c.x1 + r, minZ = c.z0 - r, maxZ = c.z1 + r
      if (px > minX && px < maxX && pz > minZ && pz < maxZ) {
        const left = px - minX, rightP = maxX - px, top = pz - minZ, bot = maxZ - pz
        const m = Math.min(left, rightP, top, bot)
        if (m === left) px = minX
        else if (m === rightP) px = maxX
        else if (m === top) pz = minZ
        else pz = maxZ
      }
    }
    px = Math.min(Math.max(px, WORLD_BOUNDS.x0 + r), WORLD_BOUNDS.x1 - r)
    pz = Math.min(Math.max(pz, WORLD_BOUNDS.z0 + r), WORLD_BOUNDS.z1 - r)
    return [px, pz]
  }

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const s = useWorld.getState()
    const active = isPlayerActive(s) && !s.activePanel

    if (active) {
      // Touch / drag-look: apply accumulated drag deltas to yaw/pitch directly.
      if (s.touch || s.lockFallback) {
        const [dx, dy] = consumeLook()
        yaw.current -= dx * LOOK_SPEED
        pitch.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch.current - dy * LOOK_SPEED))
        euler.set(pitch.current, yaw.current, 0)
        camera.quaternion.setFromEuler(euler)
      }

      camera.getWorldDirection(forward)
      forward.y = 0
      forward.normalize()
      right.crossVectors(forward, up).normalize()

      move.set(0, 0, 0)
      const k = keys.current
      if (k["KeyW"]) move.add(forward)
      if (k["KeyS"]) move.sub(forward)
      if (k["KeyD"]) move.add(right)
      if (k["KeyA"]) move.sub(right)
      if (s.touch && (touchInput.move.x || touchInput.move.y)) {
        move.addScaledVector(forward, touchInput.move.y)
        move.addScaledVector(right, touchInput.move.x)
      }

      // Pushing the stick to its edge sprints; keyboard uses Shift.
      const stickMag = Math.hypot(touchInput.move.x, touchInput.move.y)
      const sprint = k["ShiftLeft"] || k["ShiftRight"] || stickMag > 0.92
      const speed = sprint ? SPRINT : WALK
      let nx = camera.position.x
      let nz = camera.position.z
      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(speed * dt)
        // Resolve X then Z to avoid corner tunnelling.
        ;[nx, nz] = resolveCollisions(camera.position.x + move.x, camera.position.z)
        ;[nx, nz] = resolveCollisions(nx, nz + move.z)
      }
      camera.position.x = nx
      camera.position.z = nz

      // Jump + gravity (flat floor at PLAYER_EYE).
      if ((k["Space"] || touchInput.jump) && grounded.current) {
        velY.current = JUMP
        grounded.current = false
      }
      touchInput.jump = false
      velY.current -= GRAVITY * dt
      camera.position.y += velY.current * dt
      if (camera.position.y <= PLAYER_EYE) {
        camera.position.y = PLAYER_EYE
        velY.current = 0
        grounded.current = true
      }
    }

    // Nearest interactable within its radius.
    let best: (typeof INTERACTABLES)[number] | null = null
    let bestD = Infinity
    for (const it of INTERACTABLES) {
      const dx = it.position[0] - camera.position.x
      const dz = it.position[2] - camera.position.z
      const d = Math.hypot(dx, dz)
      if (d < it.radius && d < bestD) { bestD = d; best = it }
    }
    if (best?.id !== s.target?.id) s.setTarget(best)

    // Throttle HUD coordinate updates + location-based achievements.
    lastCoordPush.current += dt
    if (lastCoordPush.current > 0.15) {
      lastCoordPush.current = 0
      s.setCoords([camera.position.x, camera.position.y, camera.position.z])
      useAchievements.getState().trackPosition(camera.position.x, camera.position.z)
    }
  })

  // In fallback mode the drei controls must not mount at all — they attach a
  // click-to-lock handler to the canvas that would retry (and log errors) on
  // every click in environments where the lock can never be granted.
  return touch || lockFallback ? null : <PointerLockControls ref={controls} />
}
