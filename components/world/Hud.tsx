"use client"

import { useEffect, useState } from "react"
import { useProgress } from "@react-three/drei"
import { useWorld } from "@/lib/world/store"
import { PROFILE, STATIONS, type InteractKind } from "@/lib/world/worldData"

const requestLock = () => window.dispatchEvent(new Event("world-request-lock"))

type Slot = { key: string; icon: string; label: string; action: () => void }

function useHotbar() {
  const openPanel = useWorld((s) => s.openPanel)
  const openStation = (id: string) => {
    const st = STATIONS.find((s) => s.id === id)
    if (st) openPanel(st)
  }
  const slots: Slot[] = [
    { key: "1", icon: "🌍", label: "Guide", action: () => openStation("welcome") },
    { key: "2", icon: "🧑‍🌾", label: "NAVI", action: () => openStation("rag") },
    { key: "3", icon: "♪", label: "Jukebox", action: () => openStation("jukebox") },
    { key: "4", icon: "🛡", label: "Build", action: () => openStation("stats") },
    { key: "5", icon: "🏆", label: "Impact", action: () => openStation("impact") },
    { key: "6", icon: "📖", label: "Patch", action: () => openStation("patch") },
    { key: "7", icon: "🌀", label: "Contact", action: () => openStation("contact") },
    { key: "8", icon: "🎰", label: "Slots", action: () => openStation("slot") },
    { key: "9", icon: "❔", label: "Help", action: () => window.dispatchEvent(new Event("world-toggle-help")) },
  ]
  return slots
}

function Hotbar() {
  const slots = useHotbar()
  return (
    <div className="mc-hotbar">
      {slots.map((s) => (
        <button key={s.key} className="mc-hotslot" onClick={s.action} title={`${s.label} (${s.key})`}>
          <span className="mc-hotslot__key">{s.key}</span>
          <span className="mc-hotslot__icon">{s.icon}</span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  )
}

function StartGate() {
  const setStarted = useWorld((s) => s.setStarted)
  const { active, progress } = useProgress()
  const [ready, setReady] = useState(false)

  // Ready once textures finish loading; with a safety timeout so Enter is never stuck.
  useEffect(() => {
    if (!active && progress >= 100) setReady(true)
  }, [active, progress])
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 6000)
    return () => clearTimeout(t)
  }, [])

  const enter = () => {
    if (!ready) return
    setStarted(true)
    requestLock()
  }
  return (
    <div className="mc-fullscreen mc">
      <p style={{ fontSize: 13, letterSpacing: "0.3em", color: "#77a6ff" }}>{PROFILE.role.toUpperCase()}</p>
      <h1 style={{ fontSize: 46, color: "#ff7a48", textShadow: "3px 3px 0 #000", margin: 0 }}>{PROFILE.name}</h1>
      <p style={{ fontSize: 15, color: "#cbd5e1", maxWidth: 520, lineHeight: 1.6 }}>
        A walkable, block-built portfolio world. Explore the plaza, open project chests, talk to NAVI, and step through the contact portal.
      </p>
      <div className="mc-panel" style={{ padding: 14, fontSize: 13, color: "#e7e7ea" }}>
        <b>Controls</b> &nbsp; <span className="mc-key">W</span><span className="mc-key">A</span><span className="mc-key">S</span><span className="mc-key">D</span> move &nbsp;·&nbsp;
        mouse look &nbsp;·&nbsp; <span className="mc-key">Shift</span> sprint &nbsp;·&nbsp; <span className="mc-key">Space</span> jump &nbsp;·&nbsp;
        <span className="mc-key">E</span> interact &nbsp;·&nbsp; <span className="mc-key">1</span>–<span className="mc-key">9</span> menu &nbsp;·&nbsp; <span className="mc-key">Esc</span> release
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button className="mc-btn mc-btn--accent" style={{ fontSize: 16, padding: "12px 22px", opacity: ready ? 1 : 0.6, cursor: ready ? "pointer" : "wait" }} onClick={enter} disabled={!ready}>
          {ready ? "▶ Enter World" : `Building world… ${Math.round(progress)}%`}
        </button>
        <a className="mc-btn mc-btn--ghost" style={{ fontSize: 16, padding: "12px 22px" }} href="/classic">Skip to classic site</a>
      </div>
    </div>
  )
}

function PausedOverlay() {
  // Click anywhere resumes — each click is a fresh user gesture, so it also
  // retries past Chrome's brief re-lock cooldown after Esc.
  return (
    <div
      className="mc-fullscreen mc"
      style={{ background: "rgba(5,6,9,0.7)", cursor: "pointer" }}
      onMouseDown={requestLock}
    >
      <h2 style={{ fontSize: 30, color: "#ff7a48", textShadow: "2px 2px 0 #000", margin: 0 }}>Paused</h2>
      <p style={{ fontSize: 14, color: "#cbd5e1" }}>Click anywhere to resume.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }} onMouseDown={(e) => e.stopPropagation()}>
        <button className="mc-btn mc-btn--accent" style={{ fontSize: 15, padding: "11px 20px" }} onClick={requestLock}>▶ Resume</button>
        <button className="mc-btn mc-btn--ghost" onClick={() => window.dispatchEvent(new Event("world-toggle-help"))}>Controls</button>
        <a className="mc-btn mc-btn--ghost" href="/classic">Classic site</a>
      </div>
    </div>
  )
}

function HelpOverlay({ onClose }: { onClose: () => void }) {
  const close = useWorld((s) => s.closePanel)
  void close
  return (
    <div className="mc-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="mc-panel mc" style={{ maxWidth: 480 }}>
        <div className="mc-titlebar"><span className="mc-title">❔ Controls</span><button className="mc-btn mc-close" onClick={onClose}>✕</button></div>
        <div style={{ padding: 16, fontSize: 14, lineHeight: 2 }}>
          <div><span className="mc-key">W</span><span className="mc-key">A</span><span className="mc-key">S</span><span className="mc-key">D</span> — move</div>
          <div>Mouse — look around</div>
          <div><span className="mc-key">Shift</span> — sprint &nbsp; <span className="mc-key">Space</span> — jump</div>
          <div><span className="mc-key">E</span> — interact with the highlighted object</div>
          <div><span className="mc-key">1</span>–<span className="mc-key">9</span> — quick menu (hotbar)</div>
          <div><span className="mc-key">Esc</span> — release pointer / close panel</div>
        </div>
      </div>
    </div>
  )
}

function Crosshair() { return <div className="mc-crosshair" /> }

function Coords() {
  const coords = useWorld((s) => s.coords)
  return <div className="mc-coords mc">XYZ: {coords[0].toFixed(0)} / {coords[1].toFixed(0)} / {coords[2].toFixed(0)}</div>
}

function InteractPrompt() {
  const target = useWorld((s) => s.target)
  if (!target) return null
  const verb: Partial<Record<InteractKind, string>> = {
    project: "inspect", rag: "talk to NAVI", jukebox: "play record",
    contact: "enter portal", stats: "read board", impact: "read board",
    patch: "open book", welcome: "read sign", slot: "play slots",
  }
  return (
    <div className="mc-prompt mc">
      <span className="mc-key">E</span> {verb[target.kind] || "interact"} — <b style={{ color: target.color || "#fff" }}>{target.title}</b>
    </div>
  )
}

export function Hud() {
  const started = useWorld((s) => s.started)
  const locked = useWorld((s) => s.locked)
  const activePanel = useWorld((s) => s.activePanel)
  const openPanel = useWorld((s) => s.openPanel)
  const [help, setHelp] = useState(false)

  // Help toggle event (from hotbar / paused overlay).
  useEffect(() => {
    const t = () => setHelp((h) => !h)
    window.addEventListener("world-toggle-help", t)
    return () => window.removeEventListener("world-toggle-help", t)
  }, [])

  // Number-key quick menu + H for help.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return
      if (!started) return
      if (e.code === "KeyH") { setHelp((h) => !h); return }
      const m = e.code.match(/^Digit([1-9])$/)
      if (!m) return
      const idx = Number(m[1]) - 1
      const ids = ["welcome", "rag", "jukebox", "stats", "impact", "patch", "contact", "slot"]
      if (idx < ids.length) {
        const st = STATIONS.find((s) => s.id === ids[idx])
        if (st) openPanel(st)
      } else if (idx === 8) {
        setHelp((h) => !h)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [started, openPanel])

  if (!started) return <StartGate />

  const inGame = locked && !activePanel
  const paused = !locked && !activePanel && !help

  return (
    <>
      {inGame && <Crosshair />}
      {inGame && <Coords />}
      {inGame && <InteractPrompt />}
      {!activePanel && <Hotbar />}

      <div className="mc-topright mc">
        <a className="mc-btn mc-btn--ghost" href="/classic" style={{ fontSize: 12 }}>Skip to classic ↗</a>
      </div>

      {paused && <PausedOverlay />}
      {help && <HelpOverlay onClose={() => setHelp(false)} />}
    </>
  )
}
