"use client"

/**
 * Synthesized sound effects for the scroll/bottle wall (no audio files).
 * Lazy AudioContext created on first use (after a user gesture).
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = false

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(ctx.destination)
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {})
  return ctx
}

export function setScrollMuted(v: boolean) {
  muted = v
  if (master) master.gain.value = v ? 0 : 0.6
}

function noise(c: AudioContext, dur: number) {
  const len = Math.floor(c.sampleRate * dur)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

function tone(freq0: number, freq1: number, t0: number, dur: number, type: OscillatorType = "sine", peak = 0.25) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq0, t0)
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq1), t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g); g.connect(master)
  osc.start(t0); osc.stop(t0 + dur + 0.02)
}

/** Cork pop — short upward blip. */
export function playUncork() {
  const c = ensure(); if (!c || muted) return
  tone(260, 620, c.currentTime, 0.12, "sine", 0.3)
}

/** Throw whoosh — band-passed noise sweep. */
export function playThrow() {
  const c = ensure(); if (!c || !master || muted) return
  const t = c.currentTime
  const src = c.createBufferSource(); src.buffer = noise(c, 0.5)
  const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.2
  bp.frequency.setValueAtTime(500, t); bp.frequency.exponentialRampToValueAtTime(2200, t + 0.28)
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)
  src.connect(bp); bp.connect(g); g.connect(master)
  src.start(t)
}

/** Water splash — low-passed noise burst + a little plip. */
export function playSplash() {
  const c = ensure(); if (!c || !master || muted) return
  const t = c.currentTime
  const src = c.createBufferSource(); src.buffer = noise(c, 0.5)
  const lp = c.createBiquadFilter(); lp.type = "lowpass"
  lp.frequency.setValueAtTime(1400, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.4)
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.4, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)
  src.connect(lp); lp.connect(g); g.connect(master)
  src.start(t)
  tone(900, 420, t + 0.02, 0.18, "sine", 0.12) // droplet
}

/** Soft water plip for hover ripples (very subtle). */
export function playRipple() {
  const c = ensure(); if (!c || muted) return
  tone(1250, 720, c.currentTime, 0.1, "sine", 0.05)
}

/** Reel ratchet — a quick run of clicks (casting/reeling). */
export function playReel() {
  const c = ensure(); if (!c || muted) return
  const t = c.currentTime
  for (let i = 0; i < 6; i++) tone(1450 - i * 110, 1280 - i * 110, t + i * 0.04, 0.03, "square", 0.06)
}

/** Glassy clink when two bottles bump. */
export function playClink() {
  const c = ensure(); if (!c || muted) return
  const t = c.currentTime
  tone(900, 1340, t, 0.05, "square", 0.1)
  tone(1340, 1760, t + 0.02, 0.05, "square", 0.06)
}

/** Paper unroll — airy high-passed noise rustle. */
export function playUnroll() {
  const c = ensure(); if (!c || !master || muted) return
  const t = c.currentTime
  const src = c.createBufferSource(); src.buffer = noise(c, 0.55)
  const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1500
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.14, t + 0.05)
  g.gain.linearRampToValueAtTime(0.06, t + 0.3)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
  src.connect(hp); hp.connect(g); g.connect(master)
  src.start(t)
  tone(180, 240, t, 0.4, "triangle", 0.05)
}
