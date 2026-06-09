/**
 * Generates original CC0 pixel art for the message-in-a-bottle scroll wall:
 *   public/scroll/bottle.png   - a HORIZONTAL Minecraft-style glass bottle (floats lying down)
 *   public/scroll/parchment.png- parchment background for reading/writing scrolls
 *
 * Run: node scripts/gen-scroll-art.cjs
 */
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const OUT = path.join(__dirname, "..", "public", "scroll")
fs.mkdirSync(OUT, { recursive: true })

function noise(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 2246822519) >>> 0
  h = (h ^ (h >>> 13)) >>> 0
  h = Math.imul(h, 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)))
const sh = (c, a) => [clamp(c[0] + a), clamp(c[1] + a), clamp(c[2] + a)]

async function make(name, w, h, fn) {
  const buf = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a = 255] = fn(x, y)
      const i = (y * w + x) * 4
      buf[i] = clamp(r); buf[i + 1] = clamp(g); buf[i + 2] = clamp(b); buf[i + 3] = clamp(a)
    }
  }
  await sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(path.join(OUT, `${name}.png`))
  console.log("  ✓", name, `${w}x${h}`)
}

function inRR(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x >= x1 || y < y0 || y >= y1) return false
  const nx = x < x0 + r ? x0 + r : x >= x1 - r ? x1 - 1 - r : x
  const ny = y < y0 + r ? y0 + r : y >= y1 - r ? y1 - 1 - r : y
  const dx = x - nx, dy = y - ny
  return dx * dx + dy * dy <= r * r
}

// Horizontal bottle geometry (84 x 40)
const W = 84, H = 40
const bodyAt = (x, y) => inRR(x, y, 4, 4, 58, 36, 13)
function neckAt(x, y) {
  if (x < 57 || x >= 70) return false
  const t = (x - 57) / 13
  const top = 4 + t * 10, bot = 36 - t * 10
  return y >= top && y < bot
}
const corkAt = (x, y) => x >= 68 && x < 82 && y >= 12 && y < 28
const isGlass = (x, y) => bodyAt(x, y) || neckAt(x, y)
const scrollAt = (x, y) => x >= 13 && x < 52 && y >= 11 && y < 29 && bodyAt(x, y)

async function run() {
  console.log("Generating scroll art ->", OUT)

  await make("bottle", W, H, (x, y) => {
    if (corkAt(x, y)) {
      const n = (noise(x, y, 3) - 0.5) * 20
      return [...sh([140, 98, 56], n + (x > 78 ? 12 : 0)), 255]
    }
    if (!isGlass(x, y)) return [0, 0, 0, 0]

    // rolled scroll inside (opaque)
    if (scrollAt(x, y)) {
      const rollEnd = x < 17 || x >= 48
      const line = (x - 13) % 6 === 0 && y > 13 && y < 27
      if (rollEnd) return [...sh([205, 182, 132], (noise(x, y, 9) - 0.5) * 12), 255]
      if (line) return [150, 120, 80, 255]
      return [...sh([236, 219, 172], (noise(x, y, 8) - 0.5) * 10), 255]
    }

    const edge = !isGlass(x - 1, y) || !isGlass(x + 1, y) || !isGlass(x, y - 1) || !isGlass(x, y + 1)
    const base = [96, 188, 166]
    if (edge) return [...sh([54, 122, 106], 0), 235]
    const highlight = y >= 8 && y <= 12 ? 42 : 0 // glass glint streak
    const n = (noise(x, y, 5) - 0.5) * 14
    return [...sh(base, n + highlight), 168]
  })

  await make("parchment", 320, 200, (x, y) => {
    const n = (noise(x, y, 21) - 0.5) * 22
    const ex = Math.min(x, 319 - x), ey = Math.min(y, 199 - y)
    const edge = Math.min(ex / 26, ey / 26, 1)
    const burn = (1 - edge) * -70
    const rule = (y % 22 === 0 && y > 20 && y < 180) ? -14 : 0
    return [...sh([233, 214, 166], n + burn + rule), 255]
  })

  console.log("Done.")
}

run().catch((e) => { console.error(e); process.exit(1) })
