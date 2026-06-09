/**
 * Single source of truth for the Minecraft-style portfolio world.
 * Maps the existing portfolio content (projects, character build, impact, patch
 * notes, socials) onto world geometry: a grass island with a spawn plaza, a
 * project hall full of chests, NPC stations and a contact portal.
 *
 * Coordinate system: 1 unit = 1 block. Ground top surface is at y = 0.
 * +Z is "toward spawn", -Z heads deeper into the world (the project hall).
 */

export type Tag = "AI" | "Data" | "Backend" | "Cloud" | "Performance"

export type Project = {
  id: number
  title: string
  subtitle: string
  description: string
  year: string
  link: string
  previewUrl: string
  status?: string
  tags: Tag[]
}

// --- Content (mirrors app/works/page.tsx + app/page.tsx) -------------------

export const PROJECTS: Project[] = [
  { id: 0, title: "Quantos", subtitle: "Private, Finance Terminal, Work in Progress", description: "A finance-terminal direction focused on market context, research workflows, and fast decision support. Early-stage and actively seeking feedback/collaboration.", year: "2026", link: "https://github.com/i-am-epic", previewUrl: "https://github.com/i-am-epic", status: "WIP", tags: ["Data", "Backend", "AI"] },
  { id: 11, title: "Helios", subtitle: "Self-Healing Code, AI Agents, Work in Progress", description: "A self-healing code project exploring issue detection, safe auto-fix flows, and developer-in-the-loop remediation. In progress and open to people who want to build this with him.", year: "2026", link: "https://github.com/i-am-epic", previewUrl: "https://github.com/i-am-epic", status: "WIP", tags: ["AI", "Backend", "Performance"] },
  { id: 1, title: "TailorPro", subtitle: "Dart, Product UX, Order Workflow", description: "A beautifully designed app for tailors to manage customer records, orders, delivery status, and daily shop operations with practical UX.", year: "2026", link: "https://github.com/i-am-epic/TailorPro", previewUrl: "https://github.com/i-am-epic/TailorPro", status: "Active", tags: ["Backend", "Cloud"] },
  { id: 2, title: "FamilyTree", subtitle: "JavaScript, Graph UX, LLM-ready relations", description: "Interactive family tree explorer with hereditary relationship mapping and LLM-friendly structure for asking relation-based questions.", year: "2025", link: "https://github.com/i-am-epic/FamilyTree", previewUrl: "https://family-tree-black-nine.vercel.app/", tags: ["Data", "Backend"] },
  { id: 3, title: "Nik DevTools", subtitle: "JavaScript, Productivity, Utility Platform", description: "A practical toolkit bundling 100+ utility tools developers use frequently, designed to reduce context switching and speed up everyday work.", year: "2025", link: "https://github.com/i-am-epic/devtools", previewUrl: "https://nikdevtools.vercel.app/", tags: ["Backend", "Performance"] },
  { id: 4, title: "HouseAsAInvestment", subtitle: "Python, Finance Modeling, Decision Support", description: "A finance-first tool to evaluate whether buying a house as an investment beats alternate market options based on modeled return scenarios.", year: "2025", link: "https://github.com/i-am-epic/HouseAsAInvestment", previewUrl: "https://github.com/i-am-epic/HouseAsAInvestment", tags: ["Data", "Performance"] },
  { id: 5, title: "MakeME", subtitle: "HTML, LLM Game Loop, Leaderboards", description: "A playful LLM game where users complete challenge prompts, get AI-scored responses, and compete through a fun leaderboard loop.", year: "2025", link: "https://github.com/i-am-epic/MakeME", previewUrl: "https://github.com/i-am-epic/MakeME", tags: ["AI", "Backend"] },
  { id: 6, title: "IPOSuite", subtitle: "Python, React, FastAPI, NLP, RAG", description: "IPO screening and analysis platform with a RAG chatbot that extracts financial insights from DRHP and RHP documents.", year: "2024", link: "https://github.com/i-am-epic/IPOSuite", previewUrl: "https://github.com/i-am-epic/IPOSuite", tags: ["AI", "Data", "Backend"] },
  { id: 7, title: "Hedge-Vault", subtitle: "Python, AI/ML, Options, Risk Engine", description: "AI-driven portfolio risk project with options pricing (Monte Carlo and Black-Scholes), strategy backtesting, and portfolio analytics.", year: "2025", link: "https://github.com/i-am-epic/Hedge-Vault", previewUrl: "https://github.com/i-am-epic/Hedge-Vault", tags: ["AI", "Data"] },
  { id: 8, title: "Quantos-terminal", subtitle: "TypeScript, Finance Tooling, Terminal UI", description: "A public finance tool terminal exploring fast market workflows and terminal-like interactions for analytics and decision support.", year: "2026", link: "https://github.com/i-am-epic/Quantos-terminal", previewUrl: "https://github.com/i-am-epic/Quantos-terminal", status: "New", tags: ["Data", "Backend", "Performance"] },
  { id: 9, title: "jaunt-vibe", subtitle: "Flutter, Travel UX, Product Experiment", description: "Flutter app exploration for travel experiences and vibe-based product interactions, tied to broader Jaunt ideas.", year: "2025", link: "https://github.com/i-am-epic/jaunt-vibe", previewUrl: "https://github.com/i-am-epic/jaunt-vibe", tags: ["Cloud", "Backend"] },
  { id: 10, title: "ipodigest", subtitle: "Python, Market Data, IPO Research", description: "A practical IPO-focused tool to aggregate and summarize information for faster investor research and monitoring.", year: "2024", link: "https://github.com/i-am-epic/ipodigest", previewUrl: "https://github.com/i-am-epic/ipodigest", tags: ["Data", "Backend"] },
  { id: 12, title: "ABBReferralPortal", subtitle: "Internal Product, Workflow Automation", description: "A practical internal referral workflow tool focused on structured submissions and team collaboration flow.", year: "2025", link: "https://github.com/i-am-epic/ABBReferralPortal", previewUrl: "https://github.com/i-am-epic/ABBReferralPortal", tags: ["Backend", "Cloud"] },
  { id: 13, title: "TripPlanner", subtitle: "Python, Route Planning, Travel Intelligence", description: "Travel planning engine exploration with itinerary logic and AI-friendly flow structure for recommendations.", year: "2025", link: "https://github.com/i-am-epic", previewUrl: "https://github.com/i-am-epic", tags: ["AI", "Data", "Backend"] },
  { id: 14, title: "IPOscreener", subtitle: "Python, Market Screening, Finance Analytics", description: "Early IPO screening utility that laid the foundation for deeper finance products like IPOSuite and related tools.", year: "2023", link: "https://github.com/i-am-epic/IPOscreener", previewUrl: "https://github.com/i-am-epic/IPOscreener", tags: ["Data", "Backend"] },
  { id: 15, title: "Stock-investor-on-PE", subtitle: "Python, Automation, Market Signals", description: "Automation project using valuation filters to identify stocks with favorable P/E opportunities in sector context.", year: "2020", link: "https://github.com/i-am-epic/Stock-investor-on-PE", previewUrl: "https://github.com/i-am-epic/Stock-investor-on-PE", tags: ["Data", "Performance"] },
  { id: 16, title: "LearnMorse", subtitle: "C++, Flutter-era Utility App", description: "A learning app built around Morse training patterns and quick practice loops; one of his early product experiments.", year: "2024", link: "https://github.com/i-am-epic/LearnMorse", previewUrl: "https://github.com/i-am-epic/LearnMorse", tags: ["Backend", "Performance"] },
]

export const PROFILE = {
  name: "Nikhil A V",
  role: "AI x Data x Product",
  tagline: "Building fast data systems, market intelligence products, and AI workflows that actually ship.",
  location: "Bengaluru, India",
  email: "niknikhilav@gmail.com",
}

export const CHARACTER_BUILD = [
  { label: "Data Systems", score: "SS" },
  { label: "LLMs + RAG", score: "S" },
  { label: "Fast shipping", score: "S" },
  { label: "Founder energy", score: "S" },
  { label: "Product intuition", score: "S" },
  { label: "Debugging under pressure", score: "SS" },
  { label: "Design taste in progress", score: "A+" },
]

export const IMPACT_STATS = [
  { value: "3+", label: "years of hands-on software experience" },
  { value: "100%", label: "data consistency shipped in production" },
  { value: "70%", label: "sync latency cut on core data flows" },
  { value: "1.1M+", label: "records handled per ingestion batch" },
  { value: "40+", label: "knowledge chunks powering portfolio RAG" },
  { value: "5", label: "countries travelled across Asia" },
  { value: "100+", label: "dev utilities shipped on Nik DevTools" },
  { value: "24/7", label: "shipping mindset during product pushes" },
]

export const PATCH_NOTES = [
  "Owns high-volume data exports + ETL at ABB. 1.1M+ records, no drama.",
  "Built AI query gen for KQL, SQL, and GraphQL instead of suffering it manually.",
  "Founding-team energy: benchmarks LLMs, ships product, optimizes the ugly bits at 11pm.",
  "Visited Thailand, Malaysia, and Sri Lanka. Travelled Northeast India for 30 days because why not.",
  "Currently obsessed with simulation projects. Physical systems, agent models, market sims.",
  "Loves new tech like a kid in a toy store. New framework? Already has a side project planned.",
]

export const SOCIALS = [
  { label: "LinkedIn", href: "https://linkedin.com/in/nikhilav" },
  { label: "GitHub", href: "https://github.com/i-am-epic" },
  { label: "LeetCode", href: "https://leetcode.com/u/i-am-epic/" },
  { label: "Twitter", href: "https://twitter.com/nikhilav" },
  { label: "Instagram", href: "https://www.instagram.com/nikboson" },
]

// --- Player + world constants ----------------------------------------------

export const PLAYER_EYE = 1.7
export const PLAYER_RADIUS = 0.35
export const SPAWN = { position: [0, PLAYER_EYE, 22] as [number, number, number], yaw: Math.PI }
export const WORLD_BOUNDS = { x0: -31, x1: 31, z0: -31, z1: 31 }

export const TAG_COLOR: Record<Tag, string> = {
  AI: "#c084fc",
  Data: "#60a5fa",
  Backend: "#34d399",
  Cloud: "#38bdf8",
  Performance: "#fb923c",
}

// --- Terrain ----------------------------------------------------------------

export type BlockType =
  | "grass" | "dirt" | "stone" | "cobblestone" | "stone_bricks"
  | "oak_planks" | "dark_planks" | "oak_log" | "leaves" | "glass"
  | "water" | "glowstone" | "brand" | "path"

type Rect = { type: BlockType; x0: number; x1: number; z0: number; z1: number }

// Applied in order; later rects override earlier cells.
const GROUND_REGIONS: Rect[] = [
  { type: "grass", x0: -32, x1: 32, z0: -32, z1: 32 },
  { type: "oak_planks", x0: -13, x1: 13, z0: -30, z1: 9 }, // project hall
  { type: "stone_bricks", x0: -11, x1: 11, z0: 9, z1: 28 }, // spawn plaza
  { type: "cobblestone", x0: -6, x1: 6, z0: -32, z1: -28 }, // portal pad
  { type: "path", x0: -1, x1: 1, z0: -28, z1: 28 }, // central aisle
]

export function buildGroundMap(): Record<BlockType, [number, number][]> {
  const map = new Map<string, BlockType>()
  for (const r of GROUND_REGIONS) {
    for (let x = r.x0; x <= r.x1; x++) {
      for (let z = r.z0; z <= r.z1; z++) {
        map.set(`${x},${z}`, r.type)
      }
    }
  }
  const out = {} as Record<BlockType, [number, number][]>
  for (const [key, type] of map) {
    const [x, z] = key.split(",").map(Number)
    ;(out[type] ||= []).push([x, z])
  }
  return out
}

export type Tree = { x: number; z: number; height: number }
export const TREES: Tree[] = [
  { x: -22, z: 20, height: 5 }, { x: 23, z: 22, height: 6 },
  { x: -26, z: -4, height: 5 }, { x: 27, z: -2, height: 6 },
  { x: -20, z: -24, height: 5 }, { x: 22, z: -26, height: 5 },
  { x: -28, z: 12, height: 6 }, { x: 28, z: 14, height: 5 },
]

// --- Colliders (XZ axis-aligned boxes; treated as full-height walls) --------

export type Collider = { x0: number; x1: number; z0: number; z1: number }

// --- Interactables ----------------------------------------------------------

export type InteractKind =
  | "project" | "rag" | "jukebox" | "contact" | "stats" | "impact" | "patch" | "welcome" | "credits" | "slot"

export type Interactable = {
  id: string
  kind: InteractKind
  position: [number, number, number] // base (ground) position; structures sit on top
  radius: number
  title: string
  subtitle?: string
  color?: string
  project?: Project
}

// Project chests laid out in a grid inside the hall.
const HALL_COLS = 5
const HALL_X0 = -9
const HALL_DX = 4.5
const HALL_Z0 = 4
const HALL_DZ = -4.5

export const PROJECT_CHESTS: (Interactable & { project: Project })[] = PROJECTS.map((p, i) => {
  const col = i % HALL_COLS
  const row = Math.floor(i / HALL_COLS)
  const x = HALL_X0 + col * HALL_DX
  const z = HALL_Z0 + row * HALL_DZ
  return {
    id: `project-${p.id}`,
    kind: "project" as const,
    position: [x, 0, z] as [number, number, number],
    radius: 2.6,
    title: p.title,
    subtitle: p.year + (p.status ? ` · ${p.status}` : ""),
    color: TAG_COLOR[p.tags[0]],
    project: p,
  }
})

// Plaza feature stations.
export const STATIONS: Interactable[] = [
  { id: "welcome", kind: "welcome", position: [0, 0, 13], radius: 4, title: PROFILE.name, subtitle: PROFILE.role },
  { id: "rag", kind: "rag", position: [6, 0, 17], radius: 3, title: "NAVI", subtitle: "Ask me anything", color: "#c084fc" },
  { id: "jukebox", kind: "jukebox", position: [-6, 0, 17], radius: 3, title: "Jukebox", subtitle: "Now playing", color: "#34d399" },
  { id: "stats", kind: "stats", position: [-8, 0, 25], radius: 3.2, title: "Character Build", subtitle: "Skill ratings", color: "#fb923c" },
  { id: "impact", kind: "impact", position: [8, 0, 25], radius: 3.2, title: "Impact Board", subtitle: "Stats & achievements", color: "#60a5fa" },
  { id: "patch", kind: "patch", position: [0, 0, 25], radius: 2.6, title: "Patch Notes", subtitle: "Lore log", color: "#facc15" },
  { id: "slot", kind: "slot", position: [9, 0, 14], radius: 3, title: "Lucky Blocks", subtitle: "Spin to win!", color: "#facc15" },
  { id: "contact", kind: "contact", position: [0, 0, -29], radius: 4, title: "Contact Portal", subtitle: "Let's build together", color: "#a855f7" },
]

export const INTERACTABLES: Interactable[] = [...PROJECT_CHESTS, ...STATIONS]

// Solid colliders: each station + chest pedestal + tree trunks.
export const COLLIDERS: Collider[] = [
  ...PROJECT_CHESTS.map((c) => ({ x0: c.position[0] - 0.6, x1: c.position[0] + 0.6, z0: c.position[2] - 0.6, z1: c.position[2] + 0.6 })),
  ...TREES.map((t) => ({ x0: t.x - 0.5, x1: t.x + 0.5, z0: t.z - 0.5, z1: t.z + 0.5 })),
  // station footprints
  { x0: 4.5, x1: 7.5, z0: 16, z1: 18 }, // rag
  { x0: -7.5, x1: -4.5, z0: 16, z1: 18 }, // jukebox
  { x0: -10, x1: -6, z0: 24.4, z1: 25.6 }, // stats board
  { x0: 6, x1: 10, z0: 24.4, z1: 25.6 }, // impact wall
  { x0: -0.8, x1: 0.8, z0: 24.4, z1: 25.6 }, // patch lectern
  { x0: -1.5, x1: 1.5, z0: 12.4, z1: 13.6 }, // welcome sign
  { x0: 8.2, x1: 9.8, z0: 13.2, z1: 14.8 }, // slot machine
  { x0: -2.5, x1: 2.5, z0: -29.6, z1: -28.4 }, // portal frame
  // cottage walls (front door gap at x -22..-20 lets you walk in)
  { x0: -24, x1: -18, z0: 19.5, z1: 20.5 }, // back
  { x0: -24.5, x1: -23.5, z0: 14, z1: 20 }, // left
  { x0: -18.5, x1: -17.5, z0: 14, z1: 20 }, // right
  { x0: -24, x1: -22, z0: 13.9, z1: 14.6 }, // front-left
  { x0: -20, x1: -18, z0: 13.9, z1: 14.6 }, // front-right
]
