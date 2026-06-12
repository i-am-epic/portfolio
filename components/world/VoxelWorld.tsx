"use client"

import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { useBlockTextures } from "./useBlockTextures"
import { buildCoastCells, buildGroundMap, HILLS, TREES, type BlockType } from "@/lib/world/worldData"

const BOX = new THREE.BoxGeometry(1, 1, 1)

function InstancedBlocks({
  positions,
  material,
  cast = false,
}: {
  positions: [number, number, number][]
  material: THREE.Material | THREE.Material[]
  cast?: boolean
}) {
  const ref = useRef<THREE.InstancedMesh>(null!)

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    positions.forEach((p, i) => {
      m.makeTranslation(p[0], p[1], p[2])
      ref.current.setMatrixAt(i, m)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [positions])

  return (
    <instancedMesh
      ref={ref}
      args={[BOX, material as THREE.Material, positions.length]}
      castShadow={cast}
      receiveShadow
    />
  )
}

export function VoxelWorld() {
  const { materials, mat } = useBlockTextures()

  // Ground: one instanced mesh per block type, top surface at y = 0.
  const ground = useMemo(() => {
    const map = buildGroundMap()
    return (Object.keys(map) as BlockType[]).map((type) => ({
      type,
      positions: map[type].map(([x, z]) => [x, -0.5, z] as [number, number, number]),
    }))
  }, [])

  // Trees: trunk logs + leaf canopy, collected per material.
  const { trunks, leaves } = useMemo(() => {
    const trunks: [number, number, number][] = []
    const leaves: [number, number, number][] = []
    for (const t of TREES) {
      const base = t.y ?? 0
      for (let h = 0; h < t.height; h++) trunks.push([t.x, base + 0.5 + h, t.z])
      const top = t.height
      for (const dy of [top - 1, top]) {
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue
            leaves.push([t.x + dx, base + 0.5 + dy, t.z + dz])
          }
        }
      }
      leaves.push([t.x, base + 0.5 + top + 1, t.z])
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) leaves.push([t.x + dx, base + 0.5 + top + 1, t.z + dz])
    }
    return { trunks, leaves }
  }, [])

  // Hills: rounded grass mounds (solid props — colliders live in worldData).
  const hillBlocks = useMemo(() => {
    const out: [number, number, number][] = []
    for (const h of HILLS) {
      for (let k = 0; k < h.h; k++) {
        const rr = h.r - k * 1.1
        for (let x = Math.ceil(h.x - rr); x <= Math.floor(h.x + rr); x++) {
          for (let z = Math.ceil(h.z - rr); z <= Math.floor(h.z + rr); z++) {
            if (Math.hypot(x - h.x, z - h.z) <= rr) out.push([x, 0.5 + k, z])
          }
        }
      }
    }
    return out
  }, [])

  // Cliff sides: dirt + stone layers under every coastline cell, so the
  // island has visible sides instead of floating as a 1-block sheet.
  const coast = useMemo(() => buildCoastCells(), [])
  const cliffDirt = useMemo(() => coast.map(([x, z]) => [x, -1.5, z] as [number, number, number]), [coast])
  const cliffStone = useMemo(() => coast.map(([x, z]) => [x, -2.5, z] as [number, number, number]), [coast])

  // Surrounding sea.
  const seaMat = useMemo(() => {
    const m = mat("water", { transparent: true, opacity: 0.7 })
    if (m.map) {
      m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping
      m.map.repeat.set(120, 120)
    }
    return m
  }, [mat])

  return (
    <group>
      {ground.map((g) => (
        <InstancedBlocks key={g.type} positions={g.positions} material={materials[g.type]} />
      ))}
      <InstancedBlocks positions={hillBlocks} material={materials.grass} cast />
      <InstancedBlocks positions={cliffDirt} material={materials.dirt} />
      <InstancedBlocks positions={cliffStone} material={materials.stone} />
      <InstancedBlocks positions={trunks} material={materials.oak_log} cast />
      <InstancedBlocks positions={leaves} material={materials.leaves} cast />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <primitive object={seaMat} attach="material" />
      </mesh>
    </group>
  )
}
