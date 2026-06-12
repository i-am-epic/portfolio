import { useMemo } from "react"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"
import type { BlockType } from "@/lib/world/worldData"

const FILES: Record<string, string> = {
  grass_top: "/textures/blocks/grass_top.png",
  grass_side: "/textures/blocks/grass_side.png",
  dirt: "/textures/blocks/dirt.png",
  stone: "/textures/blocks/stone.png",
  cobblestone: "/textures/blocks/cobblestone.png",
  stone_bricks: "/textures/blocks/stone_bricks.png",
  oak_planks: "/textures/blocks/oak_planks.png",
  dark_planks: "/textures/blocks/dark_planks.png",
  oak_log_side: "/textures/blocks/oak_log_side.png",
  oak_log_top: "/textures/blocks/oak_log_top.png",
  leaves: "/textures/blocks/leaves.png",
  glass: "/textures/blocks/glass.png",
  water: "/textures/blocks/water.png",
  glowstone: "/textures/blocks/glowstone.png",
  brand: "/textures/blocks/brand_block.png",
  path: "/textures/blocks/path.png",
  sand: "/textures/blocks/sand.png",
}

type Mat = THREE.Material | THREE.Material[]

export type BlockTextures = {
  textures: Record<string, THREE.Texture>
  /** A material (or 6-face array) per block type, for BoxGeometry. */
  materials: Record<BlockType, Mat>
  /** Standalone single-face material lookup (for custom meshes). */
  mat: (name: keyof typeof FILES, opts?: MatOpts) => THREE.MeshLambertMaterial
}

type MatOpts = { transparent?: boolean; opacity?: number; alphaTest?: number; emissive?: number; emissiveIntensity?: number }

export function useBlockTextures(): BlockTextures {
  const loaded = useTexture(FILES) as unknown as Record<string, THREE.Texture>

  return useMemo(() => {
    // Crisp pixel-art filtering on every texture.
    for (const t of Object.values(loaded)) {
      t.magFilter = THREE.NearestFilter
      t.minFilter = THREE.NearestFilter
      t.generateMipmaps = false
      t.colorSpace = THREE.SRGBColorSpace
      t.needsUpdate = true
    }

    const make = (name: keyof typeof FILES, opts: MatOpts = {}) => {
      const m = new THREE.MeshLambertMaterial({
        map: loaded[name],
        transparent: opts.transparent ?? false,
        opacity: opts.opacity ?? 1,
        alphaTest: opts.alphaTest ?? 0,
        side: THREE.FrontSide,
      })
      if (opts.emissive) {
        m.emissive = new THREE.Color(opts.emissive)
        m.emissiveMap = loaded[name]
        m.emissiveIntensity = opts.emissiveIntensity ?? 1
      }
      return m
    }

    // BoxGeometry face order: [px, nx, py, ny, pz, nz] = right,left,top,bottom,front,back
    const box6 = (sides: THREE.Material, top: THREE.Material, bottom: THREE.Material) =>
      [sides, sides, top, bottom, sides, sides]

    const dirt = make("dirt")
    const grassTop = make("grass_top")
    const grassSide = make("grass_side")
    const logSide = make("oak_log_side")
    const logTop = make("oak_log_top")
    const glow = make("glowstone", { emissive: 0xffd27f, emissiveIntensity: 1.2 })
    const brand = make("brand", { emissive: 0xff7a48, emissiveIntensity: 0.6 })

    const single = (name: keyof typeof FILES, opts?: MatOpts) => {
      const m = make(name, opts)
      return [m, m, m, m, m, m]
    }

    const materials: Record<BlockType, Mat> = {
      grass: box6(grassSide, grassTop, dirt),
      dirt: dirt,
      stone: make("stone"),
      cobblestone: make("cobblestone"),
      stone_bricks: make("stone_bricks"),
      oak_planks: make("oak_planks"),
      dark_planks: make("dark_planks"),
      oak_log: box6(logSide, logTop, logTop),
      leaves: make("leaves", { transparent: true, alphaTest: 0.4 }),
      glass: make("glass", { transparent: true, opacity: 1 }),
      water: make("water", { transparent: true, opacity: 0.82 }),
      glowstone: glow,
      brand: brand,
      path: make("path"),
      sand: make("sand"),
    }
    void single

    return { textures: loaded, materials, mat: make }
  }, [loaded])
}
