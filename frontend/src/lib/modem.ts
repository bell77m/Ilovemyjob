import { muted } from './sfx'

// Fake 14.4k modem handshake made with Web Audio (no sound file): dial tones, answer tone, then screech.
// Returns hang-up; call it when the first word arrives or the request ends.
export function dialUp(): () => void {
  if (muted()) return () => {}
  let ctx: AudioContext
  try { ctx = new AudioContext() } catch { return () => {} } // no audio support: silent dial-up
  const out = ctx.createGain()
  out.gain.value = 0.06
  out.connect(ctx.destination)
  const t0 = ctx.currentTime
  const tone = (hz: number, at: number, dur: number, type: OscillatorType = 'sine') => {
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.value = hz
    o.connect(out)
    o.start(t0 + at)
    o.stop(t0 + at + dur)
    return o
  }
  // DTMF digits: each key is two sines at once.
  const keys = [[697, 1209], [770, 1336], [852, 1477], [941, 1336], [697, 1336], [770, 1477], [852, 1209]]
  keys.forEach(([lo, hi], i) => { tone(lo, i * 0.13, 0.09); tone(hi, i * 0.13, 0.09) })
  tone(2100, 1.1, 0.7) // answer tone
  const screech = tone(1200, 1.9, 2.4, 'sawtooth')
  for (let t = 1.9; t < 4.3; t += 0.07) screech.frequency.setValueAtTime(500 + Math.random() * 2500, t0 + t)
  // Hiss under the screech.
  const hiss = ctx.createBufferSource()
  hiss.buffer = ctx.createBuffer(1, ctx.sampleRate * 2.4, ctx.sampleRate)
  hiss.buffer.getChannelData(0).forEach((_, i, d) => { d[i] = Math.random() * 2 - 1 })
  hiss.connect(out)
  hiss.start(t0 + 1.9)
  const hangUp = () => { if (ctx.state !== 'closed') ctx.close().catch(() => {}) }
  setTimeout(hangUp, 4500)
  return hangUp
}
