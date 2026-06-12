"use client"

import { useMemo, useRef } from "react"
import { Text } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useBlockTextures } from "./useBlockTextures"
import { COLONNADE_Z, HILLS } from "@/lib/world/worldData"

/**
 * Landmark architecture that gives the island a skyline: a windmill and a
 * lighthouse on the hills, a pergola colonnade over the project hall, a gate
 * arch between plaza and hall, a fishing pier with a bobbing boat, and a few
 * floating islands in the sky. All decorative — colliders live in worldData.
 */

const FONT = "/fonts/Monocraft.ttf"

function useLandmarkMats() {
  const { mat } = useBlockTextures()
  return useMemo(
    () => ({
      cobble: mat("cobblestone"),
      planks: mat("oak_planks"),
      dark: mat("dark_planks"),
      log: mat("oak_log_side"),
      glow: mat("glowstone", { emissive: 0xffd27f, emissiveIntensity: 1.3 }),
      white: new THREE.MeshLambertMaterial({ color: "#e8e4da" }),
      red: new THREE.MeshLambertMaterial({ color: "#c44536" }),
      beam: new THREE.MeshBasicMaterial({ color: "#ffe9a8", transparent: true, opacity: 0.2, depthWrite: false }),
    }),
    [mat],
  )
}
type Mats = ReturnType<typeof useLandmarkMats>

// ---------- windmill (NE hill) ----------
function Windmill({ pos, mats }: { pos: [number, number, number]; mats: Mats }) {
  const blades = useRef<THREE.Group>(null!)
  useFrame((s) => {
    if (blades.current) blades.current.rotation.x = s.clock.elapsedTime * 0.7
  })
  return (
    <group position={pos}>
      {/* tower + roof */}
      <mesh position={[0, 2.5, 0]} material={mats.cobble} castShadow><boxGeometry args={[2.6, 5, 2.6]} /></mesh>
      <mesh position={[0, 5.4, 0]} material={mats.dark} castShadow><boxGeometry args={[3, 0.9, 3]} /></mesh>
      <mesh position={[0, 6.1, 0]} material={mats.dark} castShadow><boxGeometry args={[1.9, 0.7, 1.9]} /></mesh>
      {/* door + window facing the plaza (-x) */}
      <mesh position={[-1.32, 1, 0]} material={mats.dark}><boxGeometry args={[0.1, 2, 1]} /></mesh>
      <mesh position={[-1.32, 3.8, 0]} material={mats.glow}><boxGeometry args={[0.1, 0.7, 0.7]} /></mesh>
      {/* hub + rotating blades */}
      <mesh position={[-1.6, 4.6, 0]} material={mats.log}><boxGeometry args={[0.7, 0.5, 0.5]} /></mesh>
      <group ref={blades} position={[-1.95, 4.6, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[(i * Math.PI) / 2, 0, 0]}>
            <mesh position={[0, 2, 0]} material={mats.planks} castShadow><boxGeometry args={[0.12, 3.6, 0.9]} /></mesh>
            <mesh position={[0, 1, 0]} material={mats.log}><boxGeometry args={[0.16, 2, 0.18]} /></mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

// ---------- lighthouse with rotating beacon (SE hill) ----------
function Lighthouse({ pos, mats }: { pos: [number, number, number]; mats: Mats }) {
  const beam = useRef<THREE.Group>(null!)
  useFrame((s) => {
    if (beam.current) beam.current.rotation.y = s.clock.elapsedTime * 0.9
  })
  const bands = [
    { y: 0.65, s: 2.0, m: mats.white },
    { y: 1.95, s: 1.85, m: mats.red },
    { y: 3.25, s: 1.7, m: mats.white },
    { y: 4.55, s: 1.55, m: mats.red },
    { y: 5.85, s: 1.4, m: mats.white },
  ]
  return (
    <group position={pos}>
      {bands.map((b, i) => (
        <mesh key={i} position={[0, b.y, 0]} material={b.m} castShadow><boxGeometry args={[b.s, 1.3, b.s]} /></mesh>
      ))}
      {/* gallery + lamp room */}
      <mesh position={[0, 6.62, 0]} material={mats.dark} castShadow><boxGeometry args={[2, 0.24, 2]} /></mesh>
      <mesh position={[0, 7.3, 0]} material={mats.glow}><boxGeometry args={[0.8, 1.1, 0.8]} /></mesh>
      <mesh position={[0, 8, 0]} material={mats.dark} castShadow><boxGeometry args={[1.3, 0.35, 1.3]} /></mesh>
      {/* sweeping light cones */}
      <group ref={beam} position={[0, 7.3, 0]}>
        <mesh position={[3.6, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.beam}>
          <coneGeometry args={[1, 7, 10, 1, true]} />
        </mesh>
        <mesh position={[-3.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={mats.beam}>
          <coneGeometry args={[1, 7, 10, 1, true]} />
        </mesh>
      </group>
      <pointLight position={[0, 7.3, 0]} color="#ffe9a8" intensity={9} distance={22} decay={2} />
    </group>
  )
}

// ---------- pergola colonnade over the project hall ----------
function Colonnade({ mats }: { mats: Mats }) {
  return (
    <group>
      {COLONNADE_Z.map((z) => (
        <group key={z}>
          {[12.5, -12.5].map((x) => (
            <group key={x} position={[x, 0, z]}>
              <mesh position={[0, 2, 0]} material={mats.log} castShadow><boxGeometry args={[0.6, 4, 0.6]} /></mesh>
              <mesh position={[0, 4.15, 0]} material={mats.glow}><boxGeometry args={[0.7, 0.3, 0.7]} /></mesh>
            </group>
          ))}
          {/* cross beam */}
          <mesh position={[0, 4.45, z]} material={mats.dark} castShadow><boxGeometry args={[25.6, 0.35, 0.7]} /></mesh>
        </group>
      ))}
      {/* lengthwise rails connecting the pillar rows */}
      <mesh position={[12.5, 4.4, -8]} material={mats.dark}><boxGeometry args={[0.4, 0.25, 31]} /></mesh>
      <mesh position={[-12.5, 4.4, -8]} material={mats.dark}><boxGeometry args={[0.4, 0.25, 31]} /></mesh>
    </group>
  )
}

// ---------- gate arch between plaza and hall ----------
function GateArch({ mats }: { mats: Mats }) {
  return (
    <group position={[0, 0, 8.5]}>
      <mesh position={[-2, 1.8, 0]} material={mats.cobble} castShadow><boxGeometry args={[0.8, 3.6, 0.8]} /></mesh>
      <mesh position={[2, 1.8, 0]} material={mats.cobble} castShadow><boxGeometry args={[0.8, 3.6, 0.8]} /></mesh>
      <mesh position={[0, 3.9, 0]} material={mats.dark} castShadow><boxGeometry args={[5.6, 0.7, 1]} /></mesh>
      <mesh position={[0, 3.3, 0]} material={mats.glow}><boxGeometry args={[0.4, 0.4, 0.4]} /></mesh>
      {/* sign faces the plaza (+z) */}
      <Text position={[0, 3.92, 0.55]} fontSize={0.34} color="#ffcf8a" font={FONT} anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#1a1a1a">
        PROJECT HALL
      </Text>
    </group>
  )
}

// ---------- fishing pier + bobbing boat (behind spawn, decorative) ----------
function Pier({ mats }: { mats: Mats }) {
  const boat = useRef<THREE.Group>(null!)
  useFrame((s) => {
    if (!boat.current) return
    const t = s.clock.elapsedTime
    boat.current.position.y = -0.12 + Math.sin(t * 0.9) * 0.07
    boat.current.rotation.z = Math.sin(t * 0.7) * 0.04
    boat.current.rotation.x = Math.sin(t * 1.1) * 0.03
  })
  return (
    <group>
      {/* deck */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[4.5, 0.1, 34 + i * 2]} material={mats.planks} castShadow><boxGeometry args={[2.4, 0.16, 2]} /></mesh>
      ))}
      {/* posts */}
      {[34, 38, 42, 44.6].flatMap((z) => [
        <mesh key={`l${z}`} position={[3.5, -0.5, z]} material={mats.log}><boxGeometry args={[0.24, 1.6, 0.24]} /></mesh>,
        <mesh key={`r${z}`} position={[5.5, -0.5, z]} material={mats.log}><boxGeometry args={[0.24, 1.6, 0.24]} /></mesh>,
      ])}
      {/* lantern at the end */}
      <mesh position={[5.5, 0.9, 44.6]} material={mats.log}><boxGeometry args={[0.18, 1.5, 0.18]} /></mesh>
      <mesh position={[5.5, 1.8, 44.6]} material={mats.glow}><boxGeometry args={[0.4, 0.4, 0.4]} /></mesh>
      {/* rowboat */}
      <group ref={boat} position={[8.5, -0.12, 41]}>
        <mesh material={mats.dark} castShadow><boxGeometry args={[1.6, 0.55, 3.2]} /></mesh>
        <mesh position={[0, 0.18, 0]} material={mats.planks}><boxGeometry args={[1.2, 0.3, 2.7]} /></mesh>
        <mesh position={[0, 0.35, 0]} material={mats.log}><boxGeometry args={[1.3, 0.12, 0.3]} /></mesh>
      </group>
    </group>
  )
}

// ---------- floating sky islands ----------
function FloatingIsle({ pos, size, phase, mats, grass }: {
  pos: [number, number, number]
  size: number
  phase: number
  mats: Mats
  grass: THREE.Material | THREE.Material[]
}) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((s) => {
    if (ref.current) ref.current.position.y = pos[1] + Math.sin(s.clock.elapsedTime * 0.3 + phase) * 0.5
  })
  return (
    <group ref={ref} position={pos}>
      <mesh material={grass as THREE.Material}><boxGeometry args={[size, 1, size]} /></mesh>
      <mesh position={[0, -0.9, 0]} material={mats.cobble}><boxGeometry args={[size - 1.2, 0.9, size - 1.2]} /></mesh>
      <mesh position={[0, -1.6, 0]} material={mats.cobble}><boxGeometry args={[size - 2.2, 0.6, size - 2.2]} /></mesh>
      {/* glow hanging beneath — visible from the ground */}
      <mesh position={[0, -2.2, 0]} material={mats.glow}><boxGeometry args={[0.5, 0.5, 0.5]} /></mesh>
      {/* tiny tree */}
      <mesh position={[size * 0.18, 1, size * 0.12]} material={mats.log}><boxGeometry args={[0.3, 1.2, 0.3]} /></mesh>
      <mesh position={[size * 0.18, 1.9, size * 0.12]}>
        <boxGeometry args={[1.4, 1.1, 1.4]} />
        <meshLambertMaterial color="#3f8f3f" />
      </mesh>
    </group>
  )
}

export function Landmarks() {
  const mats = useLandmarkMats()
  const { materials } = useBlockTextures()
  const ne = HILLS[1]
  const se = HILLS[2]

  return (
    <group>
      <Windmill pos={[ne.x, ne.h, ne.z]} mats={mats} />
      <Lighthouse pos={[se.x, se.h, se.z]} mats={mats} />
      <Colonnade mats={mats} />
      <GateArch mats={mats} />
      <Pier mats={mats} />

      <FloatingIsle pos={[-18, 15, -22]} size={5} phase={0} mats={mats} grass={materials.grass} />
      <FloatingIsle pos={[15, 18, 30]} size={4} phase={2.2} mats={mats} grass={materials.grass} />
      <FloatingIsle pos={[-4, 21, 2]} size={3} phase={4.1} mats={mats} grass={materials.grass} />
    </group>
  )
}
