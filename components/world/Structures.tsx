"use client"

import { useMemo, useRef } from "react"
import { Billboard, Text } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useBlockTextures } from "./useBlockTextures"
import { useWorld } from "@/lib/world/store"
import {
  CHARACTER_BUILD,
  IMPACT_STATS,
  PROFILE,
  PROJECT_CHESTS,
  STATIONS,
  type Interactable,
} from "@/lib/world/worldData"

const FONT = "/fonts/Monocraft.ttf"

function Label({
  children,
  position = [0, 0, 0],
  size = 0.34,
  color = "#ffffff",
  max = 5,
}: {
  children: React.ReactNode
  position?: [number, number, number]
  size?: number
  color?: string
  max?: number
}) {
  return (
    <Text
      position={position}
      fontSize={size}
      color={color}
      font={FONT}
      anchorX="center"
      anchorY="middle"
      maxWidth={max}
      textAlign="center"
      outlineWidth={size * 0.06}
      outlineColor="#1a1a1a"
    >
      {children}
    </Text>
  )
}

function useStructureMaterials() {
  const { mat } = useBlockTextures()
  return useMemo(
    () => ({
      stone_bricks: mat("stone_bricks"),
      cobble: mat("cobblestone"),
      oak: mat("oak_planks"),
      dark: mat("dark_planks"),
      log: mat("oak_log_side"),
      glow: mat("glowstone", { emissive: 0xffd27f, emissiveIntensity: 1.3 }),
      brand: mat("brand", { emissive: 0xff7a48, emissiveIntensity: 0.7 }),
      glass: mat("glass", { transparent: true }),
    }),
    [mat],
  )
}

type Mats = ReturnType<typeof useStructureMaterials>

// ---- Chest -----------------------------------------------------------------

function Chest({ it, mats }: { it: Interactable; mats: Mats }) {
  const [x, , z] = it.position
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]} material={mats.stone_bricks} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh position={[0, 1.28, 0]} material={mats.dark} castShadow>
        <boxGeometry args={[0.86, 0.56, 0.86]} />
      </mesh>
      <mesh position={[0, 1.66, 0]} material={mats.oak} castShadow>
        <boxGeometry args={[0.9, 0.22, 0.9]} />
      </mesh>
      <mesh position={[0, 1.42, 0.45]} material={mats.brand}>
        <boxGeometry args={[0.16, 0.2, 0.06]} />
      </mesh>
      <Billboard position={[0, 2.45, 0]}>
        <Label size={0.36} color={it.color}>{it.title}</Label>
        <Label position={[0, -0.36, 0]} size={0.22} color="#cbd5e1" max={6}>{it.subtitle}</Label>
      </Billboard>
    </group>
  )
}

// ---- Villager (NAVI) -------------------------------------------------------

function Villager({ it }: { it: Interactable }) {
  const [x, , z] = it.position
  const ref = useRef<THREE.Group>(null!)
  useFrame((s) => {
    if (ref.current) ref.current.position.y = 0.02 + Math.sin(s.clock.elapsedTime * 1.5) * 0.06
  })
  return (
    <group position={[x, 0, z]}>
      <group ref={ref}>
        {/* robe */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.7, 1.4, 0.5]} />
          <meshLambertMaterial color="#6d28d9" />
        </mesh>
        {/* arms */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[1.0, 0.34, 0.42]} />
          <meshLambertMaterial color="#5b21b6" />
        </mesh>
        {/* head */}
        <mesh position={[0, 1.72, 0]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshLambertMaterial color="#d8b48a" />
        </mesh>
        {/* eyes */}
        <mesh position={[-0.14, 1.76, 0.31]}>
          <boxGeometry args={[0.1, 0.12, 0.04]} />
          <meshBasicMaterial color="#7dd3fc" />
        </mesh>
        <mesh position={[0.14, 1.76, 0.31]}>
          <boxGeometry args={[0.1, 0.12, 0.04]} />
          <meshBasicMaterial color="#7dd3fc" />
        </mesh>
        {/* nose */}
        <mesh position={[0, 1.64, 0.34]}>
          <boxGeometry args={[0.14, 0.2, 0.12]} />
          <meshLambertMaterial color="#c79a6f" />
        </mesh>
      </group>
      <Billboard position={[0, 2.7, 0]}>
        <Label size={0.4} color="#c084fc">NAVI</Label>
        <Label position={[0, -0.36, 0]} size={0.22} color="#e2e8f0" max={6}>{it.subtitle}</Label>
      </Billboard>
    </group>
  )
}

// ---- Jukebox ---------------------------------------------------------------

function Jukebox({ it, mats }: { it: Interactable; mats: Mats }) {
  const [x, , z] = it.position
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.6
  })
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.55, 0]} material={mats.dark} castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
      </mesh>
      <mesh position={[0, 1.16, 0]} material={mats.glow} castShadow>
        <boxGeometry args={[0.96, 0.14, 0.96]} />
      </mesh>
      {/* spinning record */}
      <mesh ref={ref} position={[0, 1.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 16]} />
        <meshLambertMaterial color="#111827" />
      </mesh>
      <Billboard position={[0, 2.2, 0]}>
        <Label size={0.36} color="#34d399">♪ Jukebox</Label>
        <Label position={[0, -0.34, 0]} size={0.2} color="#cbd5e1">{it.subtitle}</Label>
      </Billboard>
    </group>
  )
}

// ---- Wall board (stats / impact) ------------------------------------------

function WallBoard({ it, mats, lines }: { it: Interactable; mats: Mats; lines: string[] }) {
  const [x, , z] = it.position
  return (
    <group position={[x, 0, z]}>
      {/* posts */}
      <mesh position={[-1.6, 1.4, 0]} material={mats.log} castShadow><boxGeometry args={[0.3, 2.8, 0.3]} /></mesh>
      <mesh position={[1.6, 1.4, 0]} material={mats.log} castShadow><boxGeometry args={[0.3, 2.8, 0.3]} /></mesh>
      {/* board */}
      <mesh position={[0, 2.0, 0]} material={mats.stone_bricks} castShadow receiveShadow>
        <boxGeometry args={[3.4, 2.4, 0.3]} />
      </mesh>
      {/* text faces -Z (player approaches from the aisle) */}
      <group position={[0, 2.0, -0.18]} rotation={[0, Math.PI, 0]}>
        <Label position={[0, 0.86, 0]} size={0.3} color={it.color} max={3.1}>{it.title}</Label>
        <Text position={[0, -0.06, 0]} fontSize={0.2} color="#e5e7eb" font={FONT} anchorX="center" anchorY="middle" maxWidth={3.1} textAlign="center" lineHeight={1.4} outlineWidth={0.012} outlineColor="#1a1a1a">
          {lines.join("\n")}
        </Text>
      </group>
    </group>
  )
}

// ---- Patch lectern ---------------------------------------------------------

function Lectern({ it, mats }: { it: Interactable; mats: Mats }) {
  const [x, , z] = it.position
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.55, 0]} material={mats.dark} castShadow receiveShadow><boxGeometry args={[0.9, 1.1, 0.9]} /></mesh>
      <mesh position={[0, 1.2, 0]} rotation={[-0.5, 0, 0]} material={mats.oak} castShadow><boxGeometry args={[0.8, 0.6, 0.12]} /></mesh>
      <mesh position={[0, 1.34, 0.1]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.6, 0.44, 0.04]} />
        <meshLambertMaterial color="#f5e9c8" />
      </mesh>
      <Billboard position={[0, 2.2, 0]}>
        <Label size={0.32} color="#facc15">📖 Patch Notes</Label>
        <Label position={[0, -0.32, 0]} size={0.2} color="#cbd5e1">{it.subtitle}</Label>
      </Billboard>
    </group>
  )
}

// ---- Welcome sign ----------------------------------------------------------

function WelcomeSign({ it, mats }: { it: Interactable; mats: Mats }) {
  const [x, , z] = it.position
  return (
    <group position={[x, 0, z]}>
      <mesh position={[-2.4, 1.2, 0]} material={mats.log} castShadow><boxGeometry args={[0.34, 2.4, 0.34]} /></mesh>
      <mesh position={[2.4, 1.2, 0]} material={mats.log} castShadow><boxGeometry args={[0.34, 2.4, 0.34]} /></mesh>
      <mesh position={[0, 2.2, 0]} material={mats.oak} castShadow receiveShadow><boxGeometry args={[5.4, 1.9, 0.28]} /></mesh>
      {/* faces +Z toward spawn */}
      <group position={[0, 2.2, 0.16]}>
        <Label position={[0, 0.5, 0]} size={0.5} color="#ff7a48" max={5}>{PROFILE.name}</Label>
        <Label position={[0, -0.05, 0]} size={0.26} color="#77a6ff" max={5}>{it.subtitle}</Label>
        <Label position={[0, -0.55, 0]} size={0.18} color="#e5e7eb" max={5}>Click to look • WASD to move • E to interact</Label>
      </group>
    </group>
  )
}

// ---- Slot machine cabinet --------------------------------------------------

function SlotCabinet({ it, mats }: { it: Interactable; mats: Mats }) {
  const [x, , z] = it.position
  const screen = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    const m = screen.current?.material as THREE.MeshLambertMaterial | undefined
    if (m) m.emissiveIntensity = 1 + Math.sin(s.clock.elapsedTime * 4) * 0.4
  })
  return (
    <group position={[x, 0, z]}>
      {/* base + body + marquee */}
      <mesh position={[0, 0.3, 0]} material={mats.dark} castShadow receiveShadow><boxGeometry args={[1.3, 0.6, 1]} /></mesh>
      <mesh position={[0, 1.45, 0]} material={mats.cobble} castShadow><boxGeometry args={[1.2, 1.8, 0.9]} /></mesh>
      <mesh position={[0, 2.5, 0]} material={mats.brand} castShadow><boxGeometry args={[1.34, 0.5, 1.02]} /></mesh>
      {/* glowing screen (faces +Z, toward spawn) */}
      <mesh ref={screen} position={[0, 1.65, 0.46]} material={mats.glow}><boxGeometry args={[0.96, 0.74, 0.06]} /></mesh>
      <group position={[0, 1.65, 0.5]}>
        <Label size={0.34} color="#1a1a1a" max={1}>💎🪙⛏️</Label>
      </group>
      <group position={[0, 2.5, 0.52]}>
        <Label size={0.16} color="#1a1a1a" max={1.2}>LUCKY BLOCKS</Label>
      </group>
      {/* lever */}
      <mesh position={[0.72, 1.5, 0.2]} material={mats.log} castShadow><boxGeometry args={[0.12, 0.7, 0.12]} /></mesh>
      <mesh position={[0.72, 1.9, 0.2]} material={mats.brand}><sphereGeometry args={[0.13, 12, 12]} /></mesh>
      <Billboard position={[0, 3.3, 0]}>
        <Label size={0.38} color="#facc15">🎰 Lucky Blocks</Label>
        <Label position={[0, -0.36, 0]} size={0.22} color="#e2e8f0">{it.subtitle}</Label>
      </Billboard>
    </group>
  )
}

// ---- Contact portal --------------------------------------------------------

function Portal({ it, mats }: { it: Interactable; mats: Mats }) {
  const [x, , z] = it.position
  const inner = useRef<THREE.MeshBasicMaterial>(null!)
  useFrame((s) => {
    if (inner.current) inner.current.opacity = 0.5 + Math.sin(s.clock.elapsedTime * 2) * 0.18
  })
  const frame: [number, number, number][] = [
    [-1.6, 1.0, 0], [-1.6, 2.0, 0], [-1.6, 3.0, 0],
    [1.6, 1.0, 0], [1.6, 2.0, 0], [1.6, 3.0, 0],
    [-0.6, 3.6, 0], [0.6, 3.6, 0], [0, 3.6, 0],
    [-0.6, 0.4, 0], [0.6, 0.4, 0], [0, 0.4, 0],
  ]
  return (
    <group position={[x, 0, z]}>
      {frame.map((p, i) => (
        <mesh key={i} position={p} material={mats.brand} castShadow>
          <boxGeometry args={[1, 1, 0.8]} />
        </mesh>
      ))}
      <mesh position={[0, 2.0, 0]}>
        <planeGeometry args={[2.2, 3.0]} />
        <meshBasicMaterial ref={inner} color="#a855f7" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <Billboard position={[0, 4.4, 0]}>
        <Label size={0.42} color="#c084fc">Contact Portal</Label>
        <Label position={[0, -0.36, 0]} size={0.22} color="#e2e8f0" max={6}>{it.subtitle}</Label>
      </Billboard>
    </group>
  )
}

// ---- Target highlight (subscribes to store) --------------------------------

function TargetHighlight() {
  const ref = useRef<THREE.Group>(null!)
  const target = useWorld((s) => s.target)
  useFrame((s) => {
    if (ref.current) {
      const t = s.clock.elapsedTime
      ref.current.position.y = 0.06 + Math.sin(t * 3) * 0.05
      ref.current.rotation.y = t * 1.2
    }
  })
  if (!target) return null
  return (
    <group ref={ref} position={[target.position[0], 0.06, target.position[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[target.radius * 0.42, target.radius * 0.52, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ---- Root ------------------------------------------------------------------

export function Structures() {
  const mats = useStructureMaterials()
  const station = (id: string) => STATIONS.find((s) => s.id === id)!

  const statsLines = useMemo(
    () => CHARACTER_BUILD.map((c) => `${c.label}  [${c.score}]`),
    [],
  )
  const impactLines = useMemo(
    () => IMPACT_STATS.slice(0, 6).map((c) => `${c.value}  ${c.label}`),
    [],
  )

  return (
    <group>
      {PROJECT_CHESTS.map((c) => <Chest key={c.id} it={c} mats={mats} />)}
      <Villager it={station("rag")} />
      <Jukebox it={station("jukebox")} mats={mats} />
      <WallBoard it={station("stats")} mats={mats} lines={statsLines} />
      <WallBoard it={station("impact")} mats={mats} lines={impactLines} />
      <Lectern it={station("patch")} mats={mats} />
      <WelcomeSign it={station("welcome")} mats={mats} />
      <SlotCabinet it={station("slot")} mats={mats} />
      <Portal it={station("contact")} mats={mats} />
      <TargetHighlight />
    </group>
  )
}
