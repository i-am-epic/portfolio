"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Sky } from "@react-three/drei"
import * as THREE from "three"
import { VoxelWorld } from "./VoxelWorld"
import { Structures } from "./Structures"
import { WorldDecor } from "./WorldDecor"
import { FirstPersonController } from "./FirstPersonController"
import { Ghosts } from "./Ghosts"
import { Hud } from "./Hud"
import { Panels } from "./Panels"
import { SPAWN } from "@/lib/world/worldData"

const SUN: [number, number, number] = [80, 70, 60]

function Scene() {
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
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
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
        <Ghosts />
      </Suspense>

      <FirstPersonController />
    </>
  )
}

export default function World() {
  return (
    <div className="mc-root mc">
      <Canvas
        shadows
        dpr={[1, 1.75]}
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
        <Scene />
      </Canvas>

      <Hud />
      <Panels />
    </div>
  )
}
