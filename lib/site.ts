/**
 * Canonical site constants shared by SEO surfaces (robots, sitemap, JSON-LD,
 * llms.txt, OG image). Content itself lives in lib/world/worldData.ts.
 */

export const SITE_URL = "https://nikhilav.dev"

export const SITE_NAME = "Nikhil A V Portfolio"

export const SITE_TITLE = "Nikhil A V | Data Engineer & AI Builder"

export const SITE_DESCRIPTION =
  "Portfolio of Nikhil A V: high-performance data systems, AI products, and an explorable 3D voxel world with project chests, an AI guide, and playable mini-games."

export const ROUTES = [
  { path: "/", priority: 1.0 },
  { path: "/world", priority: 0.9 },
  { path: "/classic", priority: 0.8 },
  { path: "/works", priority: 0.8 },
  { path: "/contact", priority: 0.6 },
] as const
