"use client"

import { useEffect, useRef, useState } from "react"
import { useProgress } from "@react-three/drei"
import { useWorld } from "@/lib/world/store"
import { ACHIEVEMENTS, formatMs, useAchievements } from "@/lib/world/achievements"
import { DUEL_TARGET_HITS, PROFILE, PROJECT_CHESTS, STATIONS, type InteractKind } from "@/lib/world/worldData"
import { TouchControls } from "./TouchControls"

const requestLock = () => window.dispatchEvent(new Event("world-request-lock"))
const NAME_KEY = "world:player-name"

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
          <span className="mc-hotslot__label">{s.label}</span>
        </button>
      ))}
    </div>
  )
}

function StartGate() {
  const setStarted = useWorld((s) => s.setStarted)
  const touch = useWorld((s) => s.touch)
  const award = useAchievements((s) => s.award)
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
    award("spawn")
    if (!touch) requestLock()
  }
  return (
    <div className="mc-fullscreen mc">
      <p style={{ fontSize: 13, letterSpacing: "0.3em", color: "#77a6ff" }}>{PROFILE.role.toUpperCase()}</p>
      <h1 style={{ fontSize: 46, color: "#ff7a48", textShadow: "3px 3px 0 #000", margin: 0 }}>{PROFILE.name}</h1>
      <p style={{ fontSize: 15, color: "#cbd5e1", maxWidth: 520, lineHeight: 1.6 }}>
        A walkable, block-built portfolio world. Explore the plaza, open project chests, talk to NAVI, and step through the contact portal.
      </p>
      <div className="mc-panel" style={{ padding: 14, fontSize: 13, color: "#e7e7ea" }}>
        {touch ? (
          <>
            <b>Controls</b> &nbsp; left stick — move &nbsp;·&nbsp; drag screen — look &nbsp;·&nbsp; ⤒ jump &nbsp;·&nbsp; tap the glowing button to interact
          </>
        ) : (
          <>
            <b>Controls</b> &nbsp; <span className="mc-key">W</span><span className="mc-key">A</span><span className="mc-key">S</span><span className="mc-key">D</span> move &nbsp;·&nbsp;
            mouse look &nbsp;·&nbsp; <span className="mc-key">Shift</span> sprint &nbsp;·&nbsp; <span className="mc-key">Space</span> jump &nbsp;·&nbsp;
            <span className="mc-key">E</span> interact &nbsp;·&nbsp; <span className="mc-key">1</span>–<span className="mc-key">9</span> menu &nbsp;·&nbsp; <span className="mc-key">Esc</span> release
          </>
        )}
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
  const touch = useWorld((s) => s.touch)
  return (
    <div className="mc-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="mc-panel mc" style={{ maxWidth: 480 }}>
        <div className="mc-titlebar"><span className="mc-title">❔ Controls</span><button className="mc-btn mc-close" onClick={onClose}>✕</button></div>
        <div style={{ padding: 16, fontSize: 14, lineHeight: 2 }}>
          {touch ? (
            <>
              <div>Left stick — move (push to the edge to sprint)</div>
              <div>Drag anywhere else — look around</div>
              <div>⤒ button — jump</div>
              <div>Glowing button — interact with the nearest object</div>
              <div>Bottom menu — jump straight to any station</div>
            </>
          ) : (
            <>
              <div><span className="mc-key">W</span><span className="mc-key">A</span><span className="mc-key">S</span><span className="mc-key">D</span> — move</div>
              <div>Mouse — look around</div>
              <div><span className="mc-key">Shift</span> — sprint &nbsp; <span className="mc-key">Space</span> — jump</div>
              <div><span className="mc-key">E</span> — interact with the highlighted object</div>
              <div><span className="mc-key">J</span> — quest journal &nbsp; <span className="mc-key">1</span>–<span className="mc-key">9</span> — quick menu</div>
              <div><span className="mc-key">Esc</span> — release pointer / close panel</div>
            </>
          )}
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
    duel: "challenge EPIC-BOT", sim: "run simulation",
  }
  return (
    <div className="mc-prompt mc">
      <span className="mc-key">E</span> {verb[target.kind] || "interact"} — <b style={{ color: target.color || "#fff" }}>{target.title}</b>
    </div>
  )
}

// --- Orb duel HUD --------------------------------------------------------------

function DuelHud() {
  const duel = useWorld((s) => s.duel)
  const touch = useWorld((s) => s.touch)
  const startDuel = useWorld((s) => s.startDuel)
  const endDuel = useWorld((s) => s.endDuel)
  const [flash, setFlash] = useState<"player" | "bot" | null>(null)
  const [, tick] = useState(0)

  // Re-render every 150ms during the countdown so the big number updates.
  useEffect(() => {
    if (duel.phase !== "countdown") return
    const t = setInterval(() => tick((n) => n + 1), 150)
    return () => clearInterval(t)
  }, [duel.phase])

  // Hit feedback flashes.
  useEffect(() => {
    const onHit = (e: Event) => {
      const who = (e as CustomEvent<{ who: "player" | "bot" }>).detail?.who
      if (!who) return
      setFlash(who)
      setTimeout(() => setFlash(null), 320)
    }
    window.addEventListener("world-duel-hit", onHit)
    return () => window.removeEventListener("world-duel-hit", onHit)
  }, [])

  // Result screens need the cursor back on desktop.
  const over = duel.phase === "won" || duel.phase === "lost"
  useEffect(() => {
    if (over && document.pointerLockElement) document.exitPointerLock()
  }, [over])

  if (duel.phase === "idle") return null

  const rematch = () => {
    startDuel()
    if (!touch) requestLock()
  }
  const leave = () => {
    endDuel()
    if (!touch) requestLock()
  }
  const secondsLeft = Math.max(0, Math.ceil((duel.countdownEnd - Date.now()) / 1000))

  return (
    <>
      {flash === "player" && <div className="mc-flash mc-flash--hurt" />}
      {flash === "bot" && <div className="mc-flash mc-flash--score" />}

      <div className="mc-duel-score mc">
        <span style={{ color: "#ff9d5c" }}>YOU {duel.playerHits}</span>
        <span style={{ color: "#9aa0ac" }}> — </span>
        <span style={{ color: "#22d3ee" }}>{duel.botHits} BOT</span>
        <div style={{ fontSize: 10, color: "#9aa0ac", marginTop: 2 }}>
          first to {DUEL_TARGET_HITS} · {touch ? "tap THROW" : "click to throw"}
        </div>
      </div>

      {duel.phase === "countdown" && (
        <div className="mc-duel-countdown mc">{secondsLeft > 0 ? secondsLeft : "GO!"}</div>
      )}

      {over && (
        <div className="mc-fullscreen mc" style={{ background: "rgba(5,6,9,0.72)" }}>
          <h2 style={{ fontSize: 34, color: duel.phase === "won" ? "#facc15" : "#f87171", textShadow: "2px 2px 0 #000", margin: 0 }}>
            {duel.phase === "won" ? "🏅 VICTORY!" : "💀 EPIC-BOT WINS"}
          </h2>
          <p style={{ fontSize: 15, color: "#cbd5e1" }}>
            {duel.playerHits} — {duel.botHits}
            {duel.phase === "won" ? " · The arena crown is yours." : " · It calculated your dodge. Rude."}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="mc-btn mc-btn--accent" style={{ fontSize: 15, padding: "11px 20px" }} onClick={rematch}>⚔ Rematch</button>
            <button className="mc-btn mc-btn--ghost" style={{ fontSize: 15, padding: "11px 20px" }} onClick={leave}>Walk away</button>
          </div>
        </div>
      )}
    </>
  )
}

// --- Advancements ------------------------------------------------------------

function AchievementToast() {
  const toasts = useAchievements((s) => s.toasts)
  const shiftToast = useAchievements((s) => s.shiftToast)
  const current = toasts[0]

  useEffect(() => {
    if (!current) return
    const t = setTimeout(shiftToast, 3500)
    return () => clearTimeout(t)
  }, [current, shiftToast])

  if (!current) return null
  return (
    <div className="mc-toast mc" key={current.id}>
      <span className="mc-toast__icon">{current.icon}</span>
      <span>
        <b style={{ color: "#facc15" }}>Advancement Made!</b>
        <br />
        {current.title}
      </span>
    </div>
  )
}

function QuestChip({ onOpen }: { onOpen: () => void }) {
  const unlocked = useAchievements((s) => s.unlocked)
  const n = Object.keys(unlocked).length
  return (
    <button className="mc-quest-chip mc" onClick={onOpen} title="Quest journal (J)">
      🏆 {n}/{ACHIEVEMENTS.length}
    </button>
  )
}

type Run = { name: string; ms: number; date: number }

function QuestsOverlay({ onClose }: { onClose: () => void }) {
  const { unlocked, openedChests, bestRunMs, lastRunMs, runSubmitted, resetRun, markRunSubmitted } = useAchievements()
  const [runs, setRuns] = useState<Run[]>([])
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    try { setName(window.localStorage.getItem(NAME_KEY) || "") } catch {}
    if (fetched.current) return
    fetched.current = true
    fetch("/api/speedrun", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { runs?: Run[] }) => setRuns(Array.isArray(d.runs) ? d.runs : []))
      .catch(() => {})
  }, [])

  const submit = async () => {
    if (!lastRunMs || busy) return
    setBusy(true)
    const playerName = name.trim() || "Steve"
    try { window.localStorage.setItem(NAME_KEY, playerName) } catch {}
    try {
      const res = await fetch("/api/speedrun", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, ms: lastRunMs }),
      })
      if (res.ok) {
        markRunSubmitted()
        setRuns((rs) => [...rs, { name: playerName, ms: lastRunMs, date: Date.now() }].sort((a, b) => a.ms - b.ms).slice(0, 10))
      }
    } catch {}
    setBusy(false)
  }

  return (
    <div className="mc-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="mc-panel mc" style={{ maxWidth: 560, width: "100%" }}>
        <div className="mc-titlebar"><span className="mc-title">🏆 Quest Journal</span><button className="mc-btn mc-close" onClick={onClose}>✕</button></div>
        <div className="mc-scroll" style={{ maxHeight: "62vh", padding: 14 }}>
          <div style={{ display: "grid", gap: 8 }}>
            {ACHIEVEMENTS.map((a) => {
              const done = Boolean(unlocked[a.id])
              return (
                <div key={a.id} className="mc-slot" style={{ display: "flex", gap: 12, alignItems: "center", opacity: done ? 1 : 0.55 }}>
                  <span style={{ fontSize: 24, filter: done ? "none" : "grayscale(1)" }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <b style={{ color: done ? "#facc15" : "#9aa0ac", fontSize: 14 }}>{a.title}</b>
                    <div style={{ fontSize: 12, color: "#cbd5e1" }}>{a.desc}</div>
                  </div>
                  {done && <span style={{ color: "#34d399" }}>✔</span>}
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 16, padding: 12, background: "#15161b", boxShadow: "inset 2px 2px 0 0 #34363f, inset -2px -2px 0 0 #0a0b0e" }}>
            <b style={{ color: "#7dd3fc", fontSize: 14 }}>⏱ Chest Run</b>
            <div style={{ fontSize: 12, color: "#cbd5e1", margin: "6px 0" }}>
              Open all {PROJECT_CHESTS.length} project chests as fast as you can. Progress: {openedChests.length}/{PROJECT_CHESTS.length}
              {bestRunMs !== null && <> · your best: <b style={{ color: "#34d399" }}>{formatMs(bestRunMs)}</b></>}
            </div>

            {lastRunMs !== null && !runSubmitted && (
              <div style={{ display: "flex", gap: 8, margin: "10px 0", flexWrap: "wrap" }}>
                <input
                  className="mc-input"
                  style={{ minWidth: 140 }}
                  maxLength={16}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button className="mc-btn mc-btn--accent" disabled={busy} onClick={submit}>
                  Post {formatMs(lastRunMs)} to leaderboard
                </button>
              </div>
            )}

            {runs.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {runs.slice(0, 5).map((r, i) => (
                  <div key={r.date + i} style={{ display: "flex", gap: 10, fontSize: 12, padding: "3px 0", color: "#e7e7ea" }}>
                    <span style={{ color: "#facc15", width: 22 }}>#{i + 1}</span>
                    <span style={{ flex: 1 }}>{r.name}</span>
                    <span style={{ color: "#34d399" }}>{formatMs(r.ms)}</span>
                  </div>
                ))}
              </div>
            )}

            <button className="mc-btn mc-btn--ghost" style={{ marginTop: 10, fontSize: 12 }} onClick={resetRun}>
              ↺ Reset run (keeps advancements)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hud() {
  const started = useWorld((s) => s.started)
  const locked = useWorld((s) => s.locked)
  const touch = useWorld((s) => s.touch)
  const activePanel = useWorld((s) => s.activePanel)
  const openPanel = useWorld((s) => s.openPanel)
  const duelPhase = useWorld((s) => s.duel.phase)
  const lockFallback = useWorld((s) => s.lockFallback)
  const [help, setHelp] = useState(false)
  const [quests, setQuests] = useState(false)

  // Help toggle event (from hotbar / paused overlay).
  useEffect(() => {
    const t = () => setHelp((h) => !h)
    window.addEventListener("world-toggle-help", t)
    return () => window.removeEventListener("world-toggle-help", t)
  }, [])

  // Opening an HTML overlay needs the cursor back. Help (H / 9) and the quest
  // journal (J) can be triggered while the pointer is locked — unlike station
  // panels, which unlock via openPanel — so the lock would otherwise keep the
  // cursor hidden behind the overlay and mouse moves would swing the camera.
  useEffect(() => {
    if (touch) return
    if ((help || quests) && document.pointerLockElement) document.exitPointerLock()
  }, [help, quests, touch])

  // Number-key quick menu + H for help + J for quests.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return
      if (!started) return
      if (e.code === "KeyH") { setHelp((h) => !h); return }
      if (e.code === "KeyJ") { setQuests((q) => !q); return }
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

  const inGame = (touch || lockFallback ? started : locked) && !activePanel
  const duelBusy = duelPhase !== "idle"
  const duelOver = duelPhase === "won" || duelPhase === "lost"
  const paused = !touch && !lockFallback && !locked && !activePanel && !help && !quests && !duelOver

  return (
    <>
      {inGame && !touch && <Crosshair />}
      {inGame && <Coords />}
      {inGame && !touch && lockFallback && (
        <div className="mc-coords mc" style={{ top: 84, color: "#cbd5e1" }}>
          🖱 drag to look · WASD to move
        </div>
      )}
      {inGame && !touch && !duelBusy && <InteractPrompt />}
      {inGame && touch && <TouchControls />}
      {!activePanel && !duelBusy && <Hotbar />}
      {!activePanel && !duelBusy && <QuestChip onOpen={() => setQuests(true)} />}
      <DuelHud />
      <AchievementToast />

      <div className="mc-topright mc">
        <a className="mc-btn mc-btn--ghost" href="/classic" style={{ fontSize: 12 }}>Skip to classic ↗</a>
      </div>

      {paused && <PausedOverlay />}
      {help && <HelpOverlay onClose={() => setHelp(false)} />}
      {quests && <QuestsOverlay onClose={() => setQuests(false)} />}
    </>
  )
}
