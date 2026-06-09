"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  bumpStats,
  claimMine,
  fetchCards,
  getCoins,
  getHighScore,
  getStats,
  MINE_AMOUNT,
  mineStatus,
  postCard,
  setCoins as persistCoins,
  setHighScore,
  START_COINS,
  type NameCard,
  type Stats,
} from "@/lib/world/leaderboard"
import { activeBoosts, BOOSTERS, type ActiveBoosts } from "@/lib/world/boosters"
import * as snd from "@/lib/world/slotAudio"

type Sym = { e: string; name: string; pay: [number, number, number]; weight: number; wild?: boolean; scatter?: boolean }

const SYMBOLS: Sym[] = [
  { e: "💎", name: "Diamond", pay: [20, 80, 300], weight: 3 },
  { e: "🟩", name: "Emerald", pay: [15, 50, 150], weight: 4 },
  { e: "🪙", name: "Gold", pay: [10, 30, 100], weight: 5 },
  { e: "⛏️", name: "Pickaxe", pay: [8, 24, 75], weight: 6 },
  { e: "🍎", name: "Apple", pay: [5, 15, 50], weight: 7 },
  { e: "🐷", name: "Pig", pay: [4, 12, 40], weight: 7 },
  { e: "🌳", name: "Tree", pay: [3, 9, 30], weight: 8 },
  { e: "⭐", name: "Wild", pay: [25, 100, 500], weight: 2, wild: true },
  { e: "🧨", name: "Scatter", pay: [0, 0, 0], weight: 3, scatter: true },
]
const DIAMOND = 0
const WILD = 7
const SCATTER = 8

const COLS = 5
const ROWS = 3
const BETS = [10, 25, 50]
const FREE_SPINS_AWARD = 6
const NAME_CARD_THRESHOLD = 200

const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0], [2, 1, 0, 1, 2], [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0], [1, 0, 1, 2, 1], [1, 2, 1, 0, 1],
]

function buildPool(wildSurge: boolean): number[] {
  return SYMBOLS.flatMap((s, i) => Array(s.wild && wildSurge ? s.weight + 3 : s.weight).fill(i))
}

type Eval = { totalWin: number; lineCount: number; cells: Set<string>; freeAwarded: number; scatters: number; topSymbol: number }

function evaluate(grid: number[][], bet: number, boosts: ActiveBoosts): Eval {
  const factor = bet / 10
  const cells = new Set<string>()
  let totalWin = 0
  let lineCount = 0
  let topSymbol = -1
  let topPay = 0

  for (const line of PAYLINES) {
    const syms = line.map((row, col) => grid[col][row])
    let base = syms[0]
    if (base === WILD) base = syms.find((s) => s !== WILD) ?? WILD
    if (base === SCATTER) continue
    let count = 0
    for (const s of syms) {
      if (s === base || s === WILD) count++
      else break
    }
    if (count >= 3) {
      let pay = SYMBOLS[base].pay[count - 3] * factor
      if (boosts.diamond && base === DIAMOND) pay *= 1.5
      totalWin += pay
      lineCount++
      for (let col = 0; col < count; col++) cells.add(`${col},${line[col]}`)
      if (pay > topPay) { topPay = pay; topSymbol = base }
    }
  }

  let scatters = 0
  grid.forEach((col, ci) => col.forEach((s, ri) => { if (s === SCATTER) scatters++ }))
  let freeAwarded = 0
  if (scatters >= 3) {
    freeAwarded = FREE_SPINS_AWARD + (boosts.scatter ? 2 : 0)
    totalWin += bet * scatters
    grid.forEach((col, ci) => col.forEach((s, ri) => { if (s === SCATTER) cells.add(`${ci},${ri}`) }))
    if (topSymbol === -1) topSymbol = SCATTER
  }

  if (boosts.lucky) totalWin *= 1.1

  return { totalWin: Math.round(totalWin), lineCount, cells, freeAwarded, scatters, topSymbol }
}

function fmtTime(ms: number) {
  const m = Math.ceil(ms / 60000)
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`
}

export function SlotMachine({ onClose }: { onClose: () => void }) {
  const [coins, setCoins] = useState(START_COINS)
  const [high, setHigh] = useState(START_COINS)
  const [bet, setBet] = useState(10)
  const [stats, setStats] = useState<Stats>({ spins: 0, jackpots: 0 })
  const boosts = useMemo(() => activeBoosts(stats), [stats])
  const pool = useMemo(() => buildPool(boosts.wild), [boosts.wild])

  const randCol = useMemo(() => () => [pool[(Math.random() * pool.length) | 0], pool[(Math.random() * pool.length) | 0], pool[(Math.random() * pool.length) | 0]], [pool])
  const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: COLS }, () => [0, 1, 2]))

  const [reelSpinning, setReelSpinning] = useState<boolean[]>([false, false, false, false, false])
  const [spinning, setSpinning] = useState(false)
  const [winCells, setWinCells] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<{ text: string; tone: "win" | "jackpot" | "free" | "lose" } | null>(null)
  const [effect, setEffect] = useState<"none" | "win" | "jackpot" | "free">("none")
  const [effectKey, setEffectKey] = useState(0)
  const [freeSpins, setFreeSpins] = useState(0)
  const [muted, setMutedState] = useState(false)
  const [view, setView] = useState<"game" | "leaderboard" | "paytable" | "boosters">("game")
  const [cards, setCards] = useState<NameCard[]>([])
  const [pending, setPending] = useState<{ amount: number; symbol: string } | null>(null)
  const [name, setName] = useState("Steve")
  const [mineLeft, setMineLeft] = useState(0)

  const flick = useRef<ReturnType<typeof setInterval> | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const reelSpinRef = useRef(reelSpinning)
  reelSpinRef.current = reelSpinning

  useEffect(() => {
    setCoins(getCoins())
    setHigh(getHighScore())
    setStats(getStats())
    setGrid(Array.from({ length: COLS }, randCol))
    fetchCards().then(setCards).catch(() => {})
    snd.setMuted(false)
    const tick = () => setMineLeft(mineStatus().msLeft)
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => {
    if (flick.current) clearInterval(flick.current)
    timers.current.forEach(clearTimeout)
    snd.stopSpin()
  }, [])

  const persist = (c: number) => {
    setCoins(c)
    persistCoins(c)
    setHighScore(c)
    setHigh(getHighScore())
  }

  const toggleMute = () => {
    const m = !muted
    setMutedState(m)
    snd.setMuted(m)
  }

  const spin = () => {
    if (spinning) return
    const isFree = freeSpins > 0
    if (!isFree && coins < bet) {
      setResult({ text: "Not enough coins — mine more below!", tone: "lose" })
      snd.playLose()
      return
    }
    if (isFree) setFreeSpins((f) => f - 1)
    else persist(coins - bet)

    bumpStats({ spins: 1 })
    setStats(getStats())

    snd.playLever()
    snd.startSpin()
    setSpinning(true)
    setReelSpinning([true, true, true, true, true])
    setWinCells(new Set())
    setResult(null)
    setEffect("none")

    const finalGrid = Array.from({ length: COLS }, randCol)
    flick.current = setInterval(() => {
      setGrid((g) => g.map((col, ci) => (reelSpinRef.current[ci] ? randCol() : col)))
    }, 80)

    for (let c = 0; c < COLS; c++) {
      timers.current.push(
        setTimeout(() => {
          setGrid((g) => { const ng = g.map((x) => [...x]); ng[c] = finalGrid[c]; return ng })
          setReelSpinning((rs) => { const n = [...rs]; n[c] = false; return n })
          snd.playTick()
          if (c === COLS - 1) {
            if (flick.current) { clearInterval(flick.current); flick.current = null }
            snd.stopSpin()
            setSpinning(false)
            settle(finalGrid, isFree)
          }
        }, 480 + c * 320),
      )
    }
  }

  const settle = (finalGrid: number[][], wasFree: boolean) => {
    const res = evaluate(finalGrid, bet, boosts)
    setWinCells(res.cells)

    if (res.totalWin > 0) {
      persist(getCoins() + res.totalWin)
      const jackpot = res.totalWin >= NAME_CARD_THRESHOLD
      if (jackpot) { bumpStats({ jackpots: 1 }); setStats(getStats()) }
      if (res.freeAwarded > 0) {
        setFreeSpins((f) => f + res.freeAwarded)
        setEffect("free"); snd.playJackpot()
        setResult({ text: `🧨 ${res.scatters} SCATTERS! +${res.freeAwarded} free spins · +${res.totalWin} 🪙`, tone: "free" })
      } else if (jackpot) {
        setEffect("jackpot"); snd.playJackpot()
        setResult({ text: `JACKPOT! ${res.lineCount} line${res.lineCount > 1 ? "s" : ""} · +${res.totalWin} 🪙`, tone: "jackpot" })
      } else {
        setEffect("win"); snd.playWin()
        setResult({ text: `${res.lineCount} winning line${res.lineCount > 1 ? "s" : ""} · +${res.totalWin} 🪙`, tone: "win" })
      }
      setEffectKey((k) => k + 1)
      setTimeout(() => snd.playCoin(), 180)
      if (jackpot || res.freeAwarded > 0) setPending({ amount: res.totalWin, symbol: SYMBOLS[res.topSymbol]?.e ?? "🎰" })
    } else {
      setResult({ text: wasFree ? "Free spin — no win" : "No win — spin again!", tone: "lose" })
      snd.playLose()
    }
  }

  const mine = () => {
    if (!mineStatus().ready) return
    if (claimMine()) {
      persist(getCoins() + MINE_AMOUNT)
      snd.playCoin()
      setMineLeft(mineStatus().msLeft)
      setResult({ text: `⛏️ Mined +${MINE_AMOUNT} coins! Come back in 1h.`, tone: "win" })
    }
  }

  const submitCard = () => {
    if (!pending) return
    const card: NameCard = { name: (name.trim() || "Steve").slice(0, 16), amount: pending.amount, symbol: pending.symbol, date: Date.now() }
    setCards((prev) => [card, ...prev].sort((a, b) => b.amount - a.amount).slice(0, 25))
    postCard(card)
    setPending(null)
  }

  const confetti = useMemo(
    () => Array.from({ length: 20 }, (_, i) => ({
      i, left: 4 + Math.random() * 92, delay: Math.random() * 0.35,
      e: ["💎", "🪙", "✨", "🟩", "⭐", "⛏️"][Math.floor(Math.random() * 6)], dur: 0.9 + Math.random() * 0.8,
    })),
    [effectKey],
  )

  const mineReady = mineLeft <= 0
  const unlockedCount = BOOSTERS.filter((b) => b.unlocked(stats)).length

  return (
    <div className={`mc-panel mc mc-slot-panel ${effect !== "none" ? `fx-${effect}` : ""}`} style={{ width: "100%", maxWidth: 560 }}>
      <div className="mc-titlebar">
        <span className="mc-title">🎰 Lucky Blocks</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="mc-btn mc-close" onClick={toggleMute} title="Sound">{muted ? "🔇" : "🔊"}</button>
          <button className="mc-btn mc-close" onClick={() => setView(view === "boosters" ? "game" : "boosters")} title="Boosters">⚡</button>
          <button className="mc-btn mc-close" onClick={() => setView(view === "paytable" ? "game" : "paytable")} title="Paytable">ℹ</button>
          <button className="mc-btn mc-close" onClick={() => setView(view === "leaderboard" ? "game" : "leaderboard")} title="Leaderboard">🏆</button>
          <button className="mc-btn mc-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
          <span className="mc-chip" style={{ color: "#facc15", fontSize: 14 }}>🪙 {coins}</span>
          {freeSpins > 0 && <span className="mc-chip" style={{ color: "#a7f3d0", fontSize: 13 }}>🎟 Free: {freeSpins}</span>}
          {unlockedCount > 0 && <span className="mc-chip" style={{ color: "#fbbf24", fontSize: 13 }}>⚡ {unlockedCount}</span>}
          <span className="mc-chip" style={{ color: "#7dd3fc", fontSize: 14 }}>🏆 {high}</span>
        </div>

        {view === "leaderboard" ? (
          <Leaderboard cards={cards} onBack={() => setView("game")} />
        ) : view === "paytable" ? (
          <Paytable onBack={() => setView("game")} />
        ) : view === "boosters" ? (
          <Boosters stats={stats} onBack={() => setView("game")} />
        ) : (
          <>
            <div className="mc-reels5" key={effectKey}>
              {grid.map((col, ci) => (
                <div key={ci} className={`mc-reel5 ${reelSpinning[ci] ? "spin" : ""}`}>
                  {col.map((s, ri) => (
                    <div key={ri} className={`mc-cell ${winCells.has(`${ci},${ri}`) ? "win" : ""}`}>{SYMBOLS[s].e}</div>
                  ))}
                </div>
              ))}
              {effect !== "none" && (
                <div className="mc-confetti" aria-hidden>
                  {confetti.map((c) => (
                    <span key={c.i} style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` } as React.CSSProperties}>{c.e}</span>
                  ))}
                </div>
              )}
            </div>

            <div className={`mc-slot-result ${result?.tone || ""}`}>
              {result ? result.text : "5 reels · 9 lines · ⭐ wild · 🧨 scatter = free spins"}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", margin: "10px 0" }}>
              <span style={{ fontSize: 12, color: "#cbd5e1" }}>BET</span>
              {BETS.map((b) => (
                <button key={b} className={`mc-btn ${bet === b ? "mc-btn--blue" : "mc-btn--ghost"}`} style={{ fontSize: 13, padding: "7px 12px" }} onClick={() => !spinning && setBet(b)}>{b}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="mc-btn mc-btn--accent mc-spin-btn" onClick={spin} disabled={spinning || (freeSpins === 0 && coins < bet)}>
                {spinning ? "Spinning…" : freeSpins > 0 ? "🎟 FREE SPIN" : "🕹 SPIN"}
              </button>
              <button className="mc-btn mc-btn--ghost" onClick={mine} disabled={!mineReady} title="Hourly reward">
                {mineReady ? `⛏ Mine ${MINE_AMOUNT}` : `⛏ ${fmtTime(mineLeft)}`}
              </button>
            </div>
          </>
        )}
      </div>

      {pending && (
        <div className="mc-namecard-overlay">
          <div className="mc-panel" style={{ maxWidth: 360 }}>
            <div className="mc-titlebar"><span className="mc-title">📜 Big Win!</span></div>
            <div style={{ padding: 16, textAlign: "center" }}>
              <p style={{ fontSize: 28, margin: "4px 0" }}>{pending.symbol} +{pending.amount} 🪙</p>
              <p style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 12 }}>Carve your name on the global leaderboard:</p>
              <input className="mc-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={16} onKeyDown={(e) => { if (e.key === "Enter") submitCard() }} autoFocus style={{ width: "100%", textAlign: "center", marginBottom: 12 }} />
              <button className="mc-btn mc-btn--accent" onClick={submitCard} style={{ width: "100%" }}>Carve sign ✍</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Boosters({ stats, onBack }: { stats: Stats; onBack: () => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: "#fbbf24", fontSize: 15 }}>⚡ Boosters</span>
        <button className="mc-btn mc-btn--ghost" style={{ fontSize: 12 }} onClick={onBack}>← Back</button>
      </div>
      <p style={{ fontSize: 12, color: "#9a8a6a", marginBottom: 10 }}>Spins: {stats.spins} · Jackpots: {stats.jackpots}. Perks auto-activate.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {BOOSTERS.map((b) => {
          const on = b.unlocked(stats)
          return (
            <div key={b.id} className="mc-slot" style={{ display: "flex", alignItems: "center", gap: 12, opacity: on ? 1 : 0.55 }}>
              <span style={{ fontSize: 26, filter: on ? "none" : "grayscale(1)" }}>{b.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: on ? "#a7f3d0" : "#cbd5e1" }}>{b.name} {on && "✓"}</p>
                <p style={{ fontSize: 12, color: "#9aa0ac" }}>{b.desc}</p>
              </div>
              <span className="mc-chip" style={{ fontSize: 11, color: on ? "#34d399" : "#9aa0ac" }}>{on ? "ACTIVE" : b.req}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Leaderboard({ cards, onBack }: { cards: NameCard[]; onBack: () => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: "#facc15", fontSize: 15 }}>🏆 Hall of Fame</span>
        <button className="mc-btn mc-btn--ghost" style={{ fontSize: 12 }} onClick={onBack}>← Back</button>
      </div>
      {cards.length === 0 ? (
        <div className="mc-slot" style={{ textAlign: "center", color: "#cbd5e1", fontSize: 13 }}>No legends yet. Land 200+ to carve your name!</div>
      ) : (
        <div className="mc-scroll" style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "44vh", overflowY: "auto" }}>
          {cards.map((c, i) => (
            <div key={i} className="mc-namecard">
              <span className="mc-namecard-rank">#{i + 1}</span>
              <span className="mc-namecard-sym">{c.symbol}</span>
              <span className="mc-namecard-name">{c.name}</span>
              <span className="mc-namecard-amt">+{c.amount} 🪙</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Paytable({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: "#facc15", fontSize: 15 }}>ℹ Paytable (per line, ×bet/10)</span>
        <button className="mc-btn mc-btn--ghost" style={{ fontSize: 12 }} onClick={onBack}>← Back</button>
      </div>
      <div className="mc-scroll" style={{ maxHeight: "46vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {SYMBOLS.map((s) => (
          <div key={s.name} className="mc-slot" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ fontSize: 20 }}>{s.e} <span style={{ fontSize: 12, color: "#cbd5e1" }}>{s.name}</span></span>
            <span style={{ color: "#a7f3d0" }}>
              {s.scatter ? "3+ anywhere → free spins + coins" : `3:${s.pay[0]} · 4:${s.pay[1]} · 5:${s.pay[2]}${s.wild ? " (wild)" : ""}`}
            </span>
          </div>
        ))}
        <p style={{ fontSize: 12, color: "#9a8a6a", marginTop: 4 }}>⭐ Wild substitutes for any symbol except 🧨 scatter. 9 paylines, left to right.</p>
      </div>
    </div>
  )
}
