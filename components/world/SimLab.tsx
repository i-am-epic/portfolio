"use client"

import { useMemo, useRef } from "react"
import { Billboard, Text } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useBlockTextures } from "./useBlockTextures"
import { STATIONS, type Interactable } from "@/lib/world/worldData"

/**
 * The Simulation Lab: an open pavilion on the east side of the island with
 * three interactive exhibits (falling sand, boids, n-body orbits). Each
 * pedestal opens a live canvas simulation panel.
 */

const FONT = "/fonts/Monocraft.ttf"
// Matches the stone ground region + colliders in worldData.
const LAB = { x0: 16, x1: 28, z0: 1, z1: 11, cx: 22, cz: 6 }

function Label({ children, position, size = 0.32, color = "#fff", max = 6 }: {
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

function Exhibit({ it, phase }: { it: Interactable; phase: number }) {
  const icon = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    if (!icon.current) return
    const t = s.clock.elapsedTime + phase
    icon.current.rotation.y = t * 1.1
    icon.current.rotation.x = t * 0.6
    icon.current.position.y = 1.78 + Math.sin(t * 1.8) * 0.08
  })
  return (
    <group position={[it.position[0], 0, it.position[2]]}>
      {/* pedestal */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.2, 1.1]} />
        <meshLambertMaterial color="#2b2d36" />
      </mesh>
      <mesh position={[0, 1.23, 0]}>
        <boxGeometry args={[1.16, 0.07, 1.16]} />
        <meshBasicMaterial color={it.color} />
      </mesh>
      {/* glass display case */}
      <mesh position={[0, 1.78, 0]}>
        <boxGeometry args={[0.95, 0.95, 0.95]} />
        <meshLambertMaterial color="#bfdbfe" transparent opacity={0.18} />
      </mesh>
      {/* floating icon inside */}
      <mesh ref={icon} position={[0, 1.78, 0]}>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshLambertMaterial color={it.color} emissive={it.color} emissiveIntensity={0.8} />
      </mesh>
      <Billboard position={[0, 2.95, 0]}>
        <Label size={0.32} color={it.color}>{it.title}</Label>
        <Label position={[0, -0.32, 0]} size={0.2} color="#cbd5e1">{it.subtitle}</Label>
      </Billboard>
    </group>
  )
}

export function SimLab() {
  const { mat } = useBlockTextures()
  const mats = useMemo(
    () => ({
      dark: mat("dark_planks"),
      log: mat("oak_log_side"),
      glow: mat("glowstone", { emissive: 0xffd27f, emissiveIntensity: 1.3 }),
    }),
    [mat],
  )

  const sims = useMemo(() => STATIONS.filter((s) => s.kind === "sim"), [])
  const pillars: [number, number][] = [
    [LAB.x0 + 0.6, LAB.z0 + 0.6], [LAB.x1 - 0.6, LAB.z0 + 0.6],
    [LAB.x0 + 0.6, LAB.z1 - 0.6], [LAB.x1 - 0.6, LAB.z1 - 0.6],
  ]

  return (
    <group>
      {/* pavilion pillars + flat roof */}
      {pillars.map((p, i) => (
        <mesh key={i} position={[p[0], 2, p[1]]} material={mats.log} castShadow>
          <boxGeometry args={[0.5, 4, 0.5]} />
        </mesh>
      ))}
      <mesh position={[LAB.cx, 4.15, LAB.cz]} material={mats.dark} castShadow>
        <boxGeometry args={[LAB.x1 - LAB.x0 + 1, 0.3, LAB.z1 - LAB.z0 + 1]} />
      </mesh>
      {/* under-roof lights */}
      <mesh position={[LAB.cx - 3, 3.9, LAB.cz]} material={mats.glow}><boxGeometry args={[0.5, 0.2, 0.5]} /></mesh>
      <mesh position={[LAB.cx + 3, 3.9, LAB.cz]} material={mats.glow}><boxGeometry args={[0.5, 0.2, 0.5]} /></mesh>
      <pointLight position={[LAB.cx, 3.6, LAB.cz]} color="#ffe1b0" intensity={8} distance={15} decay={2} />

      {/* lab sign above the roof */}
      <Billboard position={[LAB.cx, 5.2, LAB.cz]}>
        <Label size={0.5} color="#a78bfa" max={10}>🧪 SIMULATION LAB</Label>
        <Label position={[0, -0.45, 0]} size={0.22} color="#cbd5e1" max={9}>Tiny worlds, real rules</Label>
      </Billboard>

      {sims.map((it, i) => (
        <Exhibit key={it.id} it={it} phase={i * 2.1} />
      ))}
    </group>
  )
}
