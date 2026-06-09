/**
 * Tiny WebAudio sound engine for the Lucky Blocks slot machine.
 * Everything is synthesized at runtime (no audio files, fully owned / CC0) and
 * sounds intentionally "chiptune / Minecraft-ish" using square + triangle waves.
 *
 * The AudioContext is created lazily on the first user gesture (a spin click) to
 * satisfy browser autoplay policies.
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = false
let whir: { osc: OscillatorNode; gain: OscillatorNode | GainNode } | null = null

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {})
  return ctx
}

export function setMuted(v: boolean) {
  muted = v
  if (master) master.gain.value = v ? 0 : 0.5
}
export function isMuted() {
  return muted
}

function note(freq: number, t0: number, dur: number, type: OscillatorType = "square", peak = 0.25) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(master)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export function playLever() {
  const c = ensure(); if (!c) return
  const t = c.currentTime
  note(220, t, 0.08, "square", 0.3)
  note(140, t + 0.05, 0.12, "triangle", 0.3)
}

export function playTick() {
  const c = ensure(); if (!c) return
  const t = c.currentTime
  note(680, t, 0.05, "square", 0.22)
  note(440, t + 0.02, 0.05, "square", 0.15)
}

export function startSpin() {
  const c = ensure(); if (!c || whir) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = "sawtooth"
  osc.frequency.value = 90
  g.gain.value = 0.0001
  if (master) g.connect(master)
  g.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.1)
  // gentle wobble
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.frequency.value = 11
  lfoGain.gain.value = 18
  lfo.connect(lfoGain)
  lfoGain.connect(osc.frequency)
  osc.connect(g)
  osc.start()
  lfo.start()
  whir = { osc, gain: g }
}

export function stopSpin() {
  if (!ctx || !whir) return
  const g = whir.gain as GainNode
  try {
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12)
    whir.osc.stop(ctx.currentTime + 0.15)
  } catch {}
  whir = null
}

export function playWin() {
  const c = ensure(); if (!c) return
  const t = c.currentTime
  const seq = [523, 659, 784, 1047]
  seq.forEach((f, i) => note(f, t + i * 0.09, 0.16, "square", 0.28))
}

export function playJackpot() {
  const c = ensure(); if (!c) return
  const t = c.currentTime
  const seq = [523, 659, 784, 1047, 1319, 1568, 2093]
  seq.forEach((f, i) => {
    note(f, t + i * 0.1, 0.22, "square", 0.3)
    note(f / 2, t + i * 0.1, 0.22, "triangle", 0.18)
  })
  // sparkle tail
  for (let i = 0; i < 6; i++) note(1568 + i * 120, t + 0.7 + i * 0.06, 0.12, "square", 0.15)
}

export function playLose() {
  const c = ensure(); if (!c) return
  const t = c.currentTime
  note(200, t, 0.12, "triangle", 0.22)
  note(150, t + 0.1, 0.18, "triangle", 0.22)
}

export function playCoin() {
  const c = ensure(); if (!c) return
  const t = c.currentTime
  note(988, t, 0.06, "square", 0.2)
  note(1319, t + 0.05, 0.1, "square", 0.2)
}
