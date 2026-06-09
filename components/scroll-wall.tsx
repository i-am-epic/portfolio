"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { fetchScrolls, throwScroll, type Scroll } from "@/lib/scrolls"
import { playReel, playThrow, playUncork, playUnroll } from "@/lib/scrollAudio"
import { WaterCanvas } from "./water-canvas"
import "./scroll-wall.css"

const MAX = 280

function formatDate(ts: number) {
  try { return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) }
  catch { return "" }
}

function Bottle({ scroll, onRead, withName, popping }: { scroll: Scroll; onRead: () => void; withName?: boolean; popping?: boolean }) {
  return (
    <button className={`sw-bottle sw-bob ${popping ? "sw-pop" : ""}`} onClick={onRead} title={scroll.name || "Anonymous traveller"} aria-label="Read scroll">
      <img src="/scroll/bottle.png" alt="" className="sw-bottle-img" />
      {withName && <small>{scroll.name || "anon"}</small>}
    </button>
  )
}

export function ScrollWall() {
  const pathname = usePathname()
  const isWorld = pathname?.startsWith("/world")

  const [scrolls, setScrolls] = useState<Scroll[]>([])
  const [throwOpen, setThrowOpen] = useState(false)
  const [wallOpen, setWallOpen] = useState(false)
  const [reading, setReading] = useState<Scroll | null>(null)
  const [msg, setMsg] = useState("")
  const [name, setName] = useState("")
  const [anon, setAnon] = useState(false)
  const [sending, setSending] = useState(false)
  const [flying, setFlying] = useState(false)
  const [popId, setPopId] = useState<string | null>(null)

  useEffect(() => { fetchScrolls().then(setScrolls).catch(() => {}) }, [])

  // uncork wobble (grid) + scroll unroll
  const openRead = (s: Scroll) => {
    if (reading) return
    setPopId(s.id)
    playUncork()
    window.setTimeout(() => { playUnroll(); setReading(s); setPopId(null) }, 340)
  }

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const m = msg.trim()
    if (!m || sending) return
    setSending(true)
    playUncork()
    const scroll = await throwScroll(m, anon ? "" : name.trim())
    setSending(false)
    setMsg("")
    setThrowOpen(false)
    setFlying(true)
    playThrow()
    // the canvas adds the new bottle (splashes in) once it appears in `scrolls`
    setScrolls((prev) => [scroll, ...prev])
    window.setTimeout(() => setFlying(false), 1000)
  }

  const reel = () => { playReel(); setWallOpen(true) }

  const Tackle = (
    <>
      <button className="sw-tackle-btn sw-tackle-btn--rod" onClick={reel} title="Reel in the scrolls">
        🎣 <span className="sw-btn-label">Reel in</span> <span className="sw-count">{scrolls.length}</span>
      </button>
      <button className="sw-tackle-btn sw-tackle-btn--bucket" onClick={() => setThrowOpen(true)} title="Bait a scroll & cast it">
        🪣 <span className="sw-btn-label">Bait &amp; cast</span>
      </button>
    </>
  )

  return (
    <>
      {isWorld ? (
        <div className="sw-fabs">{Tackle}</div>
      ) : (
        <div className="sw-water" aria-label="Message in a bottle ocean">
          <WaterCanvas scrolls={scrolls} onRead={openRead} onCast={() => setThrowOpen(true)} />
          {/* fishing line + bobber — click to reel in the whole catch */}
          <button className="sw-bobber" onClick={reel} aria-label="Reel in the scrolls">
            <span className="sw-bobber-ball" />
          </button>
          <div className="sw-hint">
            {scrolls.length === 0
              ? "🎣 Tap the sea to cast the first scroll"
              : `🎣 ${scrolls.length} adrift · tap a bottle to read · tap the sea to cast`}
          </div>
        </div>
      )}

      {/* Write a scroll (parchment) */}
      {throwOpen && (
        <div className="sw-overlay" onMouseDown={(e) => e.target === e.currentTarget && setThrowOpen(false)}>
          <form className="sw-modal sw-parchment" onSubmit={submit}>
            <div className="sw-modal-head">
              <span className="sw-modal-title">📜 Write a scroll</span>
              <button type="button" className="sw-x" onClick={() => setThrowOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="sw-modal-body">
              <textarea className="sw-textarea" placeholder="Leave a message for everyone who visits… feedback, a hello, a tip, anything." value={msg} maxLength={MAX} onChange={(e) => setMsg(e.target.value)} autoFocus />
              <div className="sw-count-chars" style={{ textAlign: "right" }}>{msg.length}/{MAX}</div>
              <div className="sw-row">
                <input className="sw-input" placeholder="Your name (optional)" value={anon ? "" : name} disabled={anon} maxLength={24} onChange={(e) => setName(e.target.value)} />
                <label className="sw-check"><input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} /> Anonymous</label>
              </div>
              <div className="sw-meta">
                <span className="sw-count-chars">Floats in the ocean for everyone who visits.</span>
                <button type="submit" className="sw-btn sw-btn--throw" disabled={!msg.trim() || sending}>{sending ? "Casting…" : "🎣 Cast it out!"}</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Read-all wall */}
      {wallOpen && (
        <div className="sw-overlay" onMouseDown={(e) => e.target === e.currentTarget && setWallOpen(false)}>
          <div className="sw-modal">
            <div className="sw-modal-head">
              <span className="sw-modal-title">📜 Message Bottles ({scrolls.length})</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="sw-btn sw-btn--throw" onClick={() => { setWallOpen(false); setThrowOpen(true) }}>🪣 Cast</button>
                <button className="sw-x" onClick={() => setWallOpen(false)} aria-label="Close">✕</button>
              </div>
            </div>
            <div className="sw-modal-body">
              {scrolls.length === 0 ? (
                <p className="sw-count-chars">No scrolls have washed ashore yet. Be the first!</p>
              ) : (
                <div className="sw-grid">
                  {scrolls.map((s) => <Bottle key={s.id} scroll={s} onRead={() => openRead(s)} withName popping={popId === s.id} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Read one scroll */}
      {reading && (
        <div className="sw-overlay" onMouseDown={(e) => e.target === e.currentTarget && setReading(null)}>
          <div className="sw-modal" style={{ maxWidth: 460, background: "transparent", border: "none", boxShadow: "none" }}>
            <div className="sw-scroll">
              <button className="sw-x" onClick={() => setReading(null)} aria-label="Close" style={{ position: "absolute", top: 8, right: 8 }}>✕</button>
              <p className="sw-scroll-msg">{reading.message}</p>
              <p className="sw-scroll-by">— {reading.name || "Anonymous traveller"} · {formatDate(reading.date)}</p>
            </div>
          </div>
        </div>
      )}

      {flying && <img src="/scroll/bottle.png" alt="" className="sw-flying" />}
    </>
  )
}
