// Tiny Web Audio sound board (no sound files). One shared context; silent until the user has clicked or typed,
// so timer-driven sounds never trip the browser's autoplay block. Mute lives in localStorage.
let ctx: AudioContext | undefined

export const muted = () => { try { return localStorage.muted === '1' } catch { return false } }
export const setMuted = (m: boolean) => { try { localStorage.muted = m ? '1' : '0' } catch { /* stays on for this load */ } }

// [hz, start s, length s, wave, slide-to hz]
type Note = [number, number, number, OscillatorType?, number?]

function play(notes: Note[], vol = 0.05) {
  if (muted() || !navigator.userActivation?.hasBeenActive) return
  try { ctx ??= new AudioContext() } catch { return } // no audio support: silent
  ctx.resume().catch(() => {})
  const t0 = ctx.currentTime
  for (const [hz, at, len, type = 'square', to] of notes) {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(hz, t0 + at)
    if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + at + len)
    g.gain.setValueAtTime(vol, t0 + at)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len)
    o.connect(g).connect(ctx.destination)
    o.start(t0 + at)
    o.stop(t0 + at + len)
  }
}

export const sfx = {
  error: () => play([[880, 0, 0.12], [440, 0.12, 0.3]]), // Win95 "critical stop"-ish
  uhOh: () => play([[700, 0, 0.12, 'sine'], [470, 0.16, 0.22, 'sine']], 0.08), // ICQ message
  tada: () => play([[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.1], [1047, 0.3, 0.45]]),
  kaching: () => play([[1568, 0, 0.06, 'triangle'], [2093, 0.07, 0.5, 'triangle'], [2637, 0.07, 0.5, 'triangle']], 0.08),
  boing: () => play([[150, 0, 0.35, 'triangle', 600]], 0.1),
  // Things falling off the page: descending thuds, then a low crash.
  crash: () => play([
    [400, 0, 0.15, 'square', 200], [300, 0.25, 0.15, 'square', 150], [220, 0.5, 0.15, 'square', 110],
    [80, 0.9, 0.8, 'sawtooth', 30], [60, 0.9, 0.8, 'square', 25],
  ], 0.07),
  key: () => play([[1800 + Math.random() * 600, 0, 0.025]], 0.02), // typewriter click
  // Horror stinger: clashing screech (a semitone apart) over a low rumble, all sliding down an octave.
  scare: () => play([
    [1397, 0, 0.9, 'sawtooth', 698], [1480, 0, 0.9, 'sawtooth', 740], [2093, 0, 0.5, 'square', 1046],
    [65, 0, 1.6, 'sawtooth', 33], [69, 0, 1.6, 'sawtooth', 35],
  ], 0.06),
}
