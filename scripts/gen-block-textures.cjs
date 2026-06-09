/**
 * Generates original 16x16 Minecraft-STYLE block textures (CC0, fully owned).
 * No Mojang assets are used. Output: public/textures/blocks/*.png
 *
 * Run: node scripts/gen-block-textures.cjs
 */
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const SIZE = 16
const OUT = path.join(__dirname, "..", "public", "textures", "blocks")
fs.mkdirSync(OUT, { recursive: true })

// deterministic per-pixel hash noise in [0,1)
function noise(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 2246822519) >>> 0
  h = (h ^ (h >>> 13)) >>> 0
  h = Math.imul(h, 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)))
const shade = (c, amt) => [clamp(c[0] + amt), clamp(c[1] + amt), clamp(c[2] + amt)]

// build a texture from a per-pixel callback -> [r,g,b,a]
async function make(name, fn) {
  const buf = Buffer.alloc(SIZE * SIZE * 4)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b, a = 255] = fn(x, y)
      const i = (y * SIZE + x) * 4
      buf[i] = clamp(r); buf[i + 1] = clamp(g); buf[i + 2] = clamp(b); buf[i + 3] = clamp(a)
    }
  }
  await sharp(buf, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, `${name}.png`))
  console.log("  ✓", name)
}

// speckled fill: base colour + per-pixel brightness noise
const speckle = (base, amp, seed) => (x, y) => {
  const n = (noise(x, y, seed) - 0.5) * amp
  return [...shade(base, n), 255]
}

async function run() {
  console.log("Generating block textures ->", OUT)

  // GRASS TOP — green with subtle clumps
  await make("grass_top", (x, y) => {
    const n = (noise(x, y, 11) - 0.5) * 26
    const clump = noise(x >> 1, y >> 1, 12) > 0.82 ? -22 : 0
    return [...shade([108, 168, 70], n + clump), 255]
  })

  // GRASS SIDE — dirt with a jagged grass overhang on top
  await make("grass_side", (x, y) => {
    const grassH = 3 + (noise(x, 0, 33) > 0.6 ? 1 : 0)
    if (y < grassH) {
      const n = (noise(x, y, 11) - 0.5) * 24
      return [...shade([108, 168, 70], n), 255]
    }
    if (y === grassH && noise(x, 0, 44) > 0.5) {
      const n = (noise(x, y, 11) - 0.5) * 24
      return [...shade([96, 150, 60], n), 255]
    }
    const n = (noise(x, y, 7) - 0.5) * 22
    return [...shade([134, 96, 62], n), 255]
  })

  // DIRT
  await make("dirt", (x, y) => {
    const n = (noise(x, y, 7) - 0.5) * 24
    const pebble = noise(x, y, 8) > 0.9 ? -30 : 0
    return [...shade([134, 96, 62], n + pebble), 255]
  })

  // STONE
  await make("stone", (x, y) => {
    const n = (noise(x, y, 21) - 0.5) * 16
    const crack = noise(x, y, 22) > 0.93 ? -28 : 0
    return [...shade([128, 128, 130], n + crack), 255]
  })

  // COBBLESTONE — clustered cobbles with dark mortar grid
  await make("cobblestone", (x, y) => {
    const cell = ((x >> 2) + (y >> 2) * 7)
    const mortar = (x % 4 === 0 || y % 4 === 0)
    const base = [128, 128, 132]
    const tone = (noise(cell, 0, 31) - 0.5) * 40
    const n = (noise(x, y, 32) - 0.5) * 18
    return [...shade(base, tone + n + (mortar ? -38 : 0)), 255]
  })

  // STONE BRICKS — offset brick grid
  await make("stone_bricks", (x, y) => {
    const row = y >> 2
    const offset = row % 2 === 0 ? 0 : 4
    const mortar = (y % 4 === 0) || ((x + offset) % 8 === 0)
    const n = (noise(x, y, 41) - 0.5) * 14
    return [...shade([122, 122, 124], n + (mortar ? -34 : 4)), 255]
  })

  // OAK PLANKS — horizontal planks with seams + nails
  await make("oak_planks", (x, y) => {
    const seam = y % 4 === 0
    const nail = (x % 8 === 1) && (y % 4 === 2)
    const grain = (noise(x, y >> 2, 51) - 0.5) * 18
    let c = shade([164, 130, 80], grain)
    if (seam) c = shade([164, 130, 80], -34)
    if (nail) c = shade([164, 130, 80], -48)
    return [...c, 255]
  })

  // DARK OAK PLANKS — accent wood
  await make("dark_planks", (x, y) => {
    const seam = y % 4 === 0
    const grain = (noise(x, y >> 2, 53) - 0.5) * 16
    let c = shade([92, 62, 36], grain)
    if (seam) c = shade([92, 62, 36], -22)
    return [...c, 255]
  })

  // OAK LOG SIDE — vertical bark
  await make("oak_log_side", (x, y) => {
    const stripe = (noise(x, 0, 61) - 0.5) * 26
    const n = (noise(x, y, 62) - 0.5) * 14
    const edge = (x === 0 || x === 15) ? -26 : 0
    return [...shade([108, 84, 50], stripe + n + edge), 255]
  })

  // OAK LOG TOP — concentric rings
  await make("oak_log_top", (x, y) => {
    const dx = x - 7.5, dy = y - 7.5
    const d = Math.sqrt(dx * dx + dy * dy)
    const ring = Math.sin(d * 2.1) * 16
    const n = (noise(x, y, 63) - 0.5) * 10
    const core = d < 1.6 ? -22 : 0
    return [...shade([170, 138, 92], ring + n + core), 255]
  })

  // LEAVES — leafy green with transparent gaps
  await make("leaves", (x, y) => {
    if (noise(x, y, 71) > 0.86) return [0, 0, 0, 0] // hole
    const n = (noise(x, y, 72) - 0.5) * 40
    return [...shade([62, 116, 44], n), 255]
  })

  // GLASS — transparent with framed border + highlight
  await make("glass", (x, y) => {
    const border = (x === 0 || y === 0 || x === 15 || y === 15)
    if (border) return [206, 232, 255, 150]
    if (x === y || x === y - 1) return [230, 244, 255, 90] // diagonal glint
    return [200, 226, 250, 26]
  })

  // WATER — translucent blue
  await make("water", (x, y) => {
    const n = (noise(x, (y + (x >> 2)) , 81) - 0.5) * 22
    return [...shade([48, 96, 190], n), 205]
  })

  // GLOWSTONE — bright emissive-looking speckle
  await make("glowstone", (x, y) => {
    const n = (noise(x, y, 91) - 0.5) * 36
    const spark = noise(x, y, 92) > 0.78 ? 38 : 0
    return [...shade([226, 188, 96], n + spark), 255]
  })

  // BRAND BLOCK — beacon-like orange/blue marker (brand colours)
  await make("brand_block", (x, y) => {
    const dx = x - 7.5, dy = y - 7.5
    const d = Math.sqrt(dx * dx + dy * dy)
    const orange = [255, 122, 72]
    const blue = [119, 166, 255]
    const t = Math.min(1, d / 9)
    const base = [
      orange[0] * (1 - t) + blue[0] * t,
      orange[1] * (1 - t) + blue[1] * t,
      orange[2] * (1 - t) + blue[2] * t,
    ]
    const n = (noise(x, y, 95) - 0.5) * 16
    const core = d < 2 ? 40 : 0
    return [...shade(base, n + core), 255]
  })

  // PATH / DIRT PATH — for walkways
  await make("path", (x, y) => {
    const edge = (x === 0 || y === 0 || x === 15 || y === 15) ? -18 : 0
    const n = (noise(x, y, 101) - 0.5) * 16
    return [...shade([150, 124, 80], n + edge), 255]
  })

  console.log("Done.")
}

run().catch((e) => { console.error(e); process.exit(1) })
