import { WorldClient } from "@/components/world/WorldClient"
import { PROFILE, PROJECTS, SOCIALS } from "@/lib/world/worldData"
import { projectsJsonLd } from "@/lib/structured-data"

// Visually-hidden but server-rendered content so crawlers / no-JS visitors still
// get the real portfolio data and links. The full classic site lives at /classic.
const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
}

export default function WorldPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsJsonLd()) }}
      />
      <WorldClient />

      <section style={srOnly}>
        <h1>{PROFILE.name} — {PROFILE.role}</h1>
        <p>{PROFILE.tagline}</p>
        <p>
          This is an interactive 3D world portfolio. Prefer a standard page?{" "}
          <a href="/classic">Open the classic portfolio</a>.
        </p>
        <h2>Projects</h2>
        <ul>
          {PROJECTS.map((p) => (
            <li key={p.id}>
              <a href={p.previewUrl || p.link}>{p.title}</a> — {p.subtitle}. {p.description}
            </li>
          ))}
        </ul>
        <h2>Links</h2>
        <ul>
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a href={s.href}>{s.label}</a>
            </li>
          ))}
          <li>
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          </li>
        </ul>
      </section>

      <noscript>
        <div style={{ padding: 24, color: "#fff", background: "#0b0d12", minHeight: "100vh" }}>
          <h1>{PROFILE.name}</h1>
          <p>{PROFILE.tagline}</p>
          <p>
            The 3D world needs JavaScript. <a href="/classic" style={{ color: "#ff7a48" }}>Open the classic portfolio →</a>
          </p>
        </div>
      </noscript>
    </>
  )
}
