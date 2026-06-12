"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * A boids flock circling the island — a live simulation running in the sky.
 * Classic three rules (separation / alignment / cohesion) plus a soft pull
 * toward the island centre so the flock never drifts out to sea.
 */

const N = 32
const NEIGHBOR_R2 = 4 * 4
const SEP_R2 = 1.6 * 1.6
const MIN_SPEED = 4
const MAX_SPEED = 8
const CENTER = new THREE.Vector3(0, 15, 0)
const RANGE_XZ = 36
const MIN_Y = 9
const MAX_Y = 23

export function Birds() {
  const mesh = useRef<THREE.InstancedMesh>(null!)

  const { pos, vel } = useMemo(() => {
    const pos: THREE.Vector3[] = []
    const vel: THREE.Vector3[] = []
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      pos.push(new THREE.Vector3(Math.cos(a) * 24, MIN_Y + Math.random() * 10, Math.sin(a) * 24))
      vel.push(new THREE.Vector3(-Math.sin(a), (Math.random() - 0.5) * 0.4, Math.cos(a)).multiplyScalar(5.5))
    }
    return { pos, vel }
  }, [])

  const tmp = useMemo(() => ({
    sep: new THREE.Vector3(),
    ali: new THREE.Vector3(),
    coh: new THREE.Vector3(),
    diff: new THREE.Vector3(),
    m: new THREE.Matrix4(),
    q: new THREE.Quaternion(),
    up: new THREE.Vector3(0, 1, 0),
    dir: new THREE.Vector3(),
    scale: new THREE.Vector3(1, 1, 1),
  }), [])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const { sep, ali, coh, diff, m, q, up, dir, scale } = tmp

    for (let i = 0; i < N; i++) {
      sep.set(0, 0, 0); ali.set(0, 0, 0); coh.set(0, 0, 0)
      let count = 0
      for (let j = 0; j < N; j++) {
        if (i === j) continue
        diff.copy(pos[i]).sub(pos[j])
        const d2 = diff.lengthSq()
        if (d2 > NEIGHBOR_R2) continue
        count++
        ali.add(vel[j])
        coh.add(pos[j])
        if (d2 < SEP_R2 && d2 > 0.0001) sep.addScaledVector(diff, 1 / d2)
      }
      if (count > 0) {
        ali.multiplyScalar(1 / count).sub(vel[i]).multiplyScalar(0.05)
        coh.multiplyScalar(1 / count).sub(pos[i]).multiplyScalar(0.02)
        vel[i].add(ali).add(coh).addScaledVector(sep, 1.6)
      }

      // Soft containment toward the island centre.
      diff.copy(CENTER).sub(pos[i])
      const horiz = Math.hypot(diff.x, diff.z)
      if (horiz > RANGE_XZ) vel[i].addScaledVector(diff, 0.04)
      if (pos[i].y < MIN_Y) vel[i].y += 4 * dt * 10
      if (pos[i].y > MAX_Y) vel[i].y -= 4 * dt * 10

      const sp = vel[i].length()
      if (sp > MAX_SPEED) vel[i].multiplyScalar(MAX_SPEED / sp)
      else if (sp < MIN_SPEED) vel[i].multiplyScalar(MIN_SPEED / Math.max(sp, 0.01))

      pos[i].addScaledVector(vel[i], dt)

      dir.copy(vel[i]).normalize()
      q.setFromUnitVectors(up, dir)
      m.compose(pos[i], q, scale)
      mesh.current.setMatrixAt(i, m)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, N]} frustumCulled={false}>
      <coneGeometry args={[0.16, 0.6, 4]} />
      <meshLambertMaterial color="#273449" />
    </instancedMesh>
  )
}
