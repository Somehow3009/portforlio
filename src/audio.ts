// Web Audio API sound engine — procedural, no audio assets needed.

let ctx: AudioContext | null = null
let master: GainNode | null = null
let ambientNodes: { gain: GainNode; oscs: OscillatorNode[] } | null = null
let enabled = true

function ensure() {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function setEnabled(on: boolean) {
  enabled = on
  if (master) master.gain.value = on ? 0.6 : 0
}

function noiseBuffer(ctx: AudioContext, seconds = 0.5) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function playTone(
  freq: number,
  dur: number,
  type: OscillatorType = 'sine',
  gainVol = 0.2,
  glideTo?: number,
  when = 0,
) {
  if (!enabled) return
  const c = ensure()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + when)
  if (glideTo)
    osc.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + when + dur)
  gain.gain.setValueAtTime(0.0001, c.currentTime + when)
  gain.gain.exponentialRampToValueAtTime(gainVol, c.currentTime + when + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur)
  osc.connect(gain)
  gain.connect(master!)
  osc.start(c.currentTime + when)
  osc.stop(c.currentTime + when + dur + 0.05)
}

export const audio = {
  unlock() {
    ensure()
  },
  startAmbient() {
    if (ambientNodes) return
    const c = ensure()
    const gain = c.createGain()
    gain.gain.value = 0.0
    gain.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 3)
    const oscs: OscillatorNode[] = []
    // Low sci-fi drone
    const o1 = c.createOscillator()
    o1.type = 'sine'
    o1.frequency.value = 55
    const o2 = c.createOscillator()
    o2.type = 'sine'
    o2.frequency.value = 82.4
    const g1 = c.createGain()
    g1.gain.value = 0.5
    const g2 = c.createGain()
    g2.gain.value = 0.3
    o1.connect(g1).connect(gain)
    o2.connect(g2).connect(gain)
    o1.start()
    o2.start()
    oscs.push(o1, o2)
    // occasional filter sweep for movement
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 300
    gain.connect(filter).connect(master!)
    // slow LFO on filter
    const lfo = c.createOscillator()
    lfo.frequency.value = 0.08
    const lfoGain = c.createGain()
    lfoGain.gain.value = 150
    lfo.connect(lfoGain).connect(filter.frequency)
    lfo.start()
    oscs.push(lfo)
    ambientNodes = { gain, oscs }
  },
  stopAmbient() {
    if (!ambientNodes) return
    const { gain, oscs } = ambientNodes
    const c = ctx!
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1)
    oscs.forEach((o) => o.stop(c.currentTime + 1.1))
    ambientNodes = null
  },
  footstep() {
    if (!enabled) return
    const c = ensure()
    const src = c.createBufferSource()
    src.buffer = noiseBuffer(c, 0.08)
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 220
    const gain = c.createGain()
    gain.gain.setValueAtTime(0.0001, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.15, c.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.08)
    src.connect(filter).connect(gain).connect(master!)
    src.start()
  },
  activate() {
    playTone(180, 0.25, 'triangle', 0.2, 720)
    playTone(900, 0.4, 'sine', 0.12)
  },
  hover() {
    playTone(440, 0.08, 'sine', 0.06, 520)
  },
  arrive() {
    playTone(320, 0.6, 'sawtooth', 0.14, 960)
  },
  uiClick() {
    playTone(660, 0.06, 'square', 0.08)
  },
  whoosh() {
    playTone(90, 0.5, 'sine', 0.15, 40)
  },
  error() {
    playTone(200, 0.3, 'square', 0.12, 90)
    playTone(140, 0.4, 'square', 0.1, 70, 0.05)
  },
  send() {
    playTone(520, 0.1, 'triangle', 0.14, 780)
    playTone(780, 0.15, 'triangle', 0.12, 1040, 0.08)
    playTone(1040, 0.2, 'triangle', 0.1, 1200, 0.16)
  },
}
