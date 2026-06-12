"use client"

import { Suspense, useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { PerformanceMonitor, Sky } from "@react-three/drei"
import * as THREE from "three"
import { VoxelWorld } from "./VoxelWorld"
import { Structures } from "./Structures"
import { WorldDecor } from "./WorldDecor"
import { Landmarks } from "./Landmarks"
import { FirstPersonController } from "./FirstPersonController"
import { Ghosts } from "./Ghosts"
import { Arena } from "./Arena"
import { SimLab } from "./SimLab"
import { PhysicsProps } from "./PhysicsProps"
import { Birds } from "./Birds"
import { Hud } from "./Hud"
import { Panels } from "./Panels"
import { SPAWN } from "@/lib/world/worldData"
import { isTouchDevice } from "@/lib/world/touchInput"

const SUN: [number, number, number] = [80, 70, 60]

function Scene({ shadowMapSize }: { shadowMapSize: number }) {
  return (
    <>
      <Sky sunPosition={SUN} turbidity={6} rayleigh={1.2} mieCoefficient={0.006} mieDirectionalG={0.8} />
      <fog attach="fog" args={["#aacbe6", 38, 150]} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#bcd7ff", "#5a4a36", 0.7]} />
      <directionalLight
        position={SUN}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={48}
        shadow-camera-bottom={-48}
        shadow-bias={-0.0004}
      />

      <Suspense fallback={null}>
        <VoxelWorld />
        <Structures />
        <WorldDecor />
        <Landmarks />
        <Arena />
        <SimLab />
        <PhysicsProps />
        <Birds />
        <Ghosts />
      </Suspense>

      <FirstPersonController />
    </>
  )
}

export default function World() {
  // Quality scaling: phones get a 1024px shadow map up front, and any device
  // that can't hold frame rate drops to a lower DPR cap (PerformanceMonitor
  // flips back if headroom returns).
  const [degraded, setDegraded] = useState(false)
  const shadowMapSize = useMemo(() => (isTouchDevice() ? 1024 : 2048), [])

  return (
    <div className="mc-root mc">
      <Canvas
        shadows
        dpr={degraded ? [0.8, 1.2] : [1, 1.75]}
        camera={{ fov: 72, near: 0.1, far: 320, position: SPAWN.position }}
        // powerPreference "default" + failIfMajorPerformanceCaveat:false lets the
        // context fall back to software rendering (SwiftShader) instead of refusing
        // to create one — fixes Brave (shields/no-GPU) and other no-accel setups.
        gl={{ antialias: true, powerPreference: "default", failIfMajorPerformanceCaveat: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.0
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDegraded(true)}
          onIncline={() => setDegraded(false)}
        />
        <Scene shadowMapSize={shadowMapSize} />
      </Canvas>

      <Hud />
      <Panels />
    </div>
  )
}
