import {
  CHARACTER_BUILD,
  IMPACT_STATS,
  PATCH_NOTES,
  PROFILE,
  PROJECTS,
  SOCIALS,
} from "@/lib/world/worldData"
import { SITE_URL } from "@/lib/site"

export const dynamic = "force-static"

/**
 * /llms.txt — the emerging convention for giving AI assistants a clean,
 * markdown summary of a site (https://llmstxt.org). Generated from the same
 * single source of truth as the 3D world, so it never drifts from the site.
 */
export async function GET() {
  const projects = PROJECTS.map(
    (p) => `- [${p.title}](${p.previewUrl || p.link}) (${p.year}${p.status ? `, ${p.status}` : ""}): ${p.subtitle}. ${p.description}`,
  ).join("\n")

  const body = `# ${PROFILE.name} — ${PROFILE.role}

> ${PROFILE.tagline}

${PROFILE.name} is a data engineer and AI builder based in ${PROFILE.location}. This site (${SITE_URL}) is his portfolio, presented as an explorable Minecraft-style 3D world at /world, with a conventional version at /classic.

## About

- Role: Data Engineer & AI Builder (AI x Data x Product)
- Location: ${PROFILE.location}
- Email: ${PROFILE.email}
- Currently: owns high-volume data exports + ETL at ABB; builds finance and AI side products.

## Highlights

${IMPACT_STATS.map((s) => `- ${s.value} ${s.label}`).join("\n")}

## Skills (self-rated)

${CHARACTER_BUILD.map((c) => `- ${c.label}: ${c.score}`).join("\n")}

## Projects

${projects}

## Notes

${PATCH_NOTES.map((n) => `- ${n}`).join("\n")}

## Pages

- [3D world portfolio](${SITE_URL}/world): walkable voxel island with project chests, an AI guide (NAVI), a jukebox, mini-games and a contact portal.
- [Classic portfolio](${SITE_URL}/classic): standard bento-grid version of the same content.
- [Projects](${SITE_URL}/works): full project list with filters.
- [Contact](${SITE_URL}/contact): get in touch.

## Links

${SOCIALS.map((s) => `- [${s.label}](${s.href})`).join("\n")}
- Email: ${PROFILE.email}
`

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
