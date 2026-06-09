"use client"

import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { SlotMachine } from "./SlotMachine"
import { useWorld } from "@/lib/world/store"
import {
  CHARACTER_BUILD,
  IMPACT_STATS,
  PATCH_NOTES,
  PROFILE,
  SOCIALS,
  TAG_COLOR,
  type Interactable,
  type Project,
} from "@/lib/world/worldData"

function PanelShell({
  title,
  children,
  width = 560,
}: {
  title: string
  children: React.ReactNode
  width?: number
}) {
  const close = useWorld((s) => s.closePanel)
  return (
    <div className="mc-panel mc" style={{ width: "100%", maxWidth: width, maxHeight: "82vh", display: "flex", flexDirection: "column" }}>
      <div className="mc-titlebar">
        <span className="mc-title">{title}</span>
        <button className="mc-btn mc-close" onClick={close} aria-label="Close">✕</button>
      </div>
      <div className="mc-scroll" style={{ padding: 16, overflowY: "auto" }}>{children}</div>
    </div>
  )
}

function ProjectPanel({ project, color }: { project: Project; color?: string }) {
  const hasLive = project.previewUrl && project.previewUrl !== project.link && !project.previewUrl.includes("github.com")
  return (
    <PanelShell title={`📦 ${project.title}`}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {project.tags.map((t) => (
          <span key={t} className="mc-chip" style={{ color: TAG_COLOR[t] }}>{t}</span>
        ))}
        <span className="mc-chip">{project.year}</span>
        {project.status && <span className="mc-chip" style={{ color: "#facc15" }}>{project.status}</span>}
      </div>
      <p style={{ color: color || "#fff", fontSize: 13, marginBottom: 10 }}>{project.subtitle}</p>
      <div className="mc-slot" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#d6d8de" }}>{project.description}</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <a className="mc-btn mc-btn--accent" href={project.link} target="_blank" rel="noopener noreferrer">⛏ GitHub</a>
        {hasLive && (
          <a className="mc-btn mc-btn--blue" href={project.previewUrl} target="_blank" rel="noopener noreferrer">🌐 Live preview</a>
        )}
      </div>
    </PanelShell>
  )
}

type ChatMessage = { role: "user" | "assistant"; content: string }

function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hey traveller! I'm **NAVI**. Ask me about Nikhil's projects, experience, finance work, or travel stories. 👇" },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    const updated = [...messages, { role: "user" as const, content: msg }]
    setMessages(updated)
    setInput("")
    setLoading(true)
    try {
      const res = await fetch("/api/profile-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: updated }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      setMessages((p) => [...p, { role: "assistant", content: data.answer || "No response." }])
    } catch (e) {
      const m = e instanceof Error ? e.message : "Something went wrong"
      setMessages((p) => [...p, { role: "assistant", content: `Hmm, couldn't fetch that: ${m}` }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = ["What does Nikhil work on?", "Best projects?", "Tell me a travel story"]

  return (
    <PanelShell title="🧑‍🌾 NAVI — Villager" width={620}>
      <div className="mc-scroll" style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "44vh", overflowY: "auto", paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "mc-chat-msg-user" : "mc-chat-msg-bot"}
            style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "8px 11px", fontSize: 13, lineHeight: 1.55 }}
          >
            {m.role === "assistant"
              ? <div className="mc-md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown></div>
              : m.content}
          </div>
        ))}
        {loading && <div className="mc-chat-msg-bot" style={{ alignSelf: "flex-start", padding: "8px 11px", fontSize: 13 }}>NAVI is thinking…</div>}
        <div ref={bottom} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0" }}>
        {suggestions.map((s) => (
          <button key={s} className="mc-btn mc-btn--ghost" style={{ fontSize: 11 }} onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="mc-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send() }}
          placeholder="Ask NAVI anything…"
          autoFocus
        />
        <button className="mc-btn mc-btn--accent" onClick={() => send()} disabled={loading}>Send</button>
      </div>
    </PanelShell>
  )
}

type Song = { item?: { name?: string; album?: { images?: { url: string }[] }; artists?: { name: string }[]; external_urls?: { spotify?: string } } }

function JukeboxPanel() {
  const [song, setSong] = useState<Song | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let on = true
    fetch("/api/spotify", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!on || !d) { setLoaded(true); return }
        if (d.currentlyPlaying?.item) { setSong(d.currentlyPlaying); setPlaying(true) }
        else if (d.lastPlayed?.items?.[0]?.track) { setSong({ item: d.lastPlayed.items[0].track }); setPlaying(false) }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
    return () => { on = false }
  }, [])

  const img = song?.item?.album?.images?.[0]?.url
  const track = song?.item?.name
  const artist = song?.item?.artists?.[0]?.name
  const url = song?.item?.external_urls?.spotify || "https://open.spotify.com"

  return (
    <PanelShell title="♪ Jukebox" width={460}>
      {!loaded && <p style={{ color: "#cbd5e1" }}>Loading the latest record…</p>}
      {loaded && !track && <p style={{ color: "#cbd5e1" }}>No track spinning right now. Check back later!</p>}
      {loaded && track && (
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {img && <img src={img} alt="" className="mc-pixel" width={96} height={96} style={{ boxShadow: "inset 0 0 0 3px #15161b" }} />}
          <div>
            <p style={{ fontSize: 11, color: playing ? "#34d399" : "#facc15", marginBottom: 4 }}>{playing ? "▶ NOW PLAYING" : "⏸ LAST PLAYED"}</p>
            <p style={{ fontSize: 16, fontWeight: 700, textShadow: "1px 1px 0 #000" }}>{track}</p>
            <p style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 10 }}>{artist}</p>
            <a className="mc-btn mc-btn--blue" href={url} target="_blank" rel="noopener noreferrer">Open in Spotify</a>
          </div>
        </div>
      )}
    </PanelShell>
  )
}

function ContactPanel() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(PROFILE.email); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }
  return (
    <PanelShell title="🌀 Contact Portal" width={500}>
      <p style={{ fontSize: 14, color: "#d6d8de", marginBottom: 14 }}>
        Step through to start a conversation. {PROFILE.name} is open to ambitious products and strong cofounder-level collaborators.
      </p>
      <div className="mc-slot" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <span style={{ color: "#a7f3d0" }}>{PROFILE.email}</span>
        <button className="mc-btn mc-btn--ghost" onClick={copy}>{copied ? "Copied!" : "Copy"}</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <a className="mc-btn mc-btn--accent" href={`mailto:${PROFILE.email}`}>✉ Email me</a>
        {SOCIALS.map((s) => (
          <a key={s.label} className="mc-btn mc-btn--ghost" href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
        ))}
      </div>
    </PanelShell>
  )
}

function StatsPanel() {
  return (
    <PanelShell title="🛡 Character Build" width={460}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CHARACTER_BUILD.map((c) => (
          <div key={c.label} className="mc-slot" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13 }}>{c.label}</span>
            <span className="mc-chip" style={{ color: "#fb923c", fontWeight: 700 }}>{c.score}</span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 14, fontSize: 12, color: "#cbd5e1" }}>Calm in prod, dangerous near a slow batch job, and suspiciously willing to build side quests after work.</p>
    </PanelShell>
  )
}

function ImpactPanel() {
  return (
    <PanelShell title="🏆 Impact Board" width={620}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {IMPACT_STATS.map((s) => (
          <div key={s.label} className="mc-slot">
            <p style={{ fontSize: 22, fontWeight: 700, color: "#ff9d5c", textShadow: "1px 1px 0 #000" }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </PanelShell>
  )
}

function PatchPanel() {
  return (
    <PanelShell title="📖 Patch Notes" width={560}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PATCH_NOTES.map((n, i) => (
          <div key={i} className="mc-slot" style={{ fontSize: 13, lineHeight: 1.55 }}>
            <span style={{ color: "#fb923c", marginRight: 8 }}>0{i + 1}.</span>{n}
          </div>
        ))}
      </div>
    </PanelShell>
  )
}

function WelcomePanel() {
  const close = useWorld((s) => s.closePanel)
  return (
    <PanelShell title={`🌍 ${PROFILE.name}`} width={560}>
      <p style={{ fontSize: 13, color: "#77a6ff", marginBottom: 8 }}>{PROFILE.role} · {PROFILE.location}</p>
      <p style={{ fontSize: 14, color: "#d6d8de", marginBottom: 14, lineHeight: 1.6 }}>{PROFILE.tagline}</p>
      <div className="mc-slot" style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
        <p>🧭 Walk the <b>Spawn Plaza</b> — talk to <b>NAVI</b>, spin the <b>Jukebox</b>, read the <b>Character Build</b> & <b>Impact Board</b>.</p>
        <p>📦 Head into the <b>Project Hall</b> — open chests to explore 17 builds.</p>
        <p>🌀 Reach the <b>Contact Portal</b> at the far end to get in touch.</p>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="mc-btn mc-btn--accent" onClick={close}>Let's explore →</button>
      </div>
    </PanelShell>
  )
}

export function Panels() {
  const active = useWorld((s) => s.activePanel)
  const close = useWorld((s) => s.closePanel)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [close])

  if (!active) return null

  const render = (it: Interactable) => {
    switch (it.kind) {
      case "project": return <ProjectPanel project={it.project!} color={it.color} />
      case "rag": return <ChatPanel />
      case "jukebox": return <JukeboxPanel />
      case "contact": return <ContactPanel />
      case "stats": return <StatsPanel />
      case "impact": return <ImpactPanel />
      case "patch": return <PatchPanel />
      case "welcome": return <WelcomePanel />
      case "slot": return <SlotMachine onClose={close} />
      default: return null
    }
  }

  return (
    <div className="mc-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
      {render(active)}
    </div>
  )
}
