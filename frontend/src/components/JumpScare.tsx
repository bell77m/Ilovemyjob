import { useEffect, useState } from 'react'
import { sfx } from '../lib/sfx'

const TRIGGER = /\b(fired|quit|layoffs?|laid off|resign\w*|boss|manager)\b/i

export function JumpScare() {
  return <><BlueScreen /><VirusPopups /><PageCollapse /></>
}

// Pieces that fall: every block of the page, leaving the empty window frame behind.
const PIECES = '.page > :not(header, main, footer), .page header > *, .page main > *, .page footer > *'

// The page breaks apart and falls off the screen, once per load at 3 minutes, or any time
// something dispatches a 'collapse' event (the Y2K badge). OK snaps every piece back.
function PageCollapse() {
  const [phase, setPhase] = useState<'wait' | 'fall' | 'gone'>('wait')
  const [down, setDown] = useState(false) // every piece has landed: show the error

  useEffect(() => {
    if (phase === 'fall') return
    const fall = () => setPhase('fall')
    const timer = phase === 'wait' ? setTimeout(fall, 3 * 60 * 1000) : undefined
    addEventListener('collapse', fall)
    return () => { clearTimeout(timer); removeEventListener('collapse', fall) }
  }, [phase])

  useEffect(() => {
    if (phase !== 'fall') return
    sfx.crash()
    const page = document.querySelector<HTMLElement>('.page')
    const pieces = [...document.querySelectorAll<HTMLElement>(PIECES)]
    pieces.forEach(p => {
      p.style.setProperty('--fall-delay', `${(Math.random() * 1.5).toFixed(2)}s`)
      p.style.setProperty('--fall-spin', `${Math.round(Math.random() * 80 - 40)}deg`)
      p.classList.add('falling')
    })
    page?.setAttribute('inert', '') // fallen pieces must not take focus
    document.documentElement.classList.add('collapsed')
    const landed = setTimeout(() => setDown(true), 3000) // 1.5s max delay + 1.2s fall
    return () => {
      clearTimeout(landed)
      setDown(false)
      pieces.forEach(p => p.classList.remove('falling'))
      page?.removeAttribute('inert')
      document.documentElement.classList.remove('collapsed')
    }
  }, [phase])

  if (phase !== 'fall' || !down) return null
  return (
    <div className="virus virus-final window" role="alertdialog" aria-labelledby="collapse-title" aria-describedby="collapse-msg">
      <div className="titlebar"><span id="collapse-title">Ilovemyjob</span></div>
      <div className="dialog-body">
        <span className="dialog-icon" aria-hidden="true">X</span>
        <p id="collapse-msg">This page has performed an illegal operation and fell apart.<br />Just like your career plan.</p>
      </div>
      <div className="buttons"><button type="button" className="default" autoFocus onClick={() => setPhase('gone')}>Pick up the pieces</button></div>
    </div>
  )
}

// Corporate blue screen, once per page load: when the user types a trigger word, or at 5 minutes.
// No flashing (photosensitive-safe). Any key or click closes it.
function BlueScreen() {
  const [phase, setPhase] = useState<'wait' | 'show' | 'gone'>('wait')

  useEffect(() => {
    if (phase !== 'wait') return
    const show = () => setPhase('show')
    const timer = setTimeout(show, 5 * 60 * 1000)
    const onInput = (e: Event) => { if (e.target instanceof HTMLTextAreaElement && TRIGGER.test(e.target.value)) show() }
    addEventListener('input', onInput)
    return () => { clearTimeout(timer); removeEventListener('input', onInput) }
  }, [phase])

  useEffect(() => {
    if (phase !== 'show') return
    sfx.scare()
    // preventDefault: the dismissing key must not land in the textarea behind the screen
    const close = (e: Event) => { e.preventDefault(); setPhase('gone') }
    addEventListener('keydown', close)
    addEventListener('pointerdown', close)
    return () => { removeEventListener('keydown', close); removeEventListener('pointerdown', close) }
  }, [phase])

  if (phase !== 'show') return null
  return (
    <div className="bsod" role="alert">
      <p className="center"><span className="bsod-label">LINKEDIN</span></p>
      <p>A fatal exception 0E has occurred at 0028:C0FFEE01 in VXD SYNERGY.DLL(01).</p>
      <p>Your manager has scheduled: "Quick chat 🙂"<br />Friday 4:55 PM. No agenda. HR is an optional attendee.</p>
      <p>* Press any key to accept the meeting.<br />* Press CTRL+ALT+DEL to set your profile to "Open to Work".</p>
      <p className="center">Press any key to continue <span className="bsod-cursor">_</span></p>
    </div>
  )
}

const SPAM = [
  'CONGRATULATIONS!!! You are the 1,000,000th visitor! Click OK to claim your FREE promotion.',
  'Gary from Synergy Corp wants to connect.',
  'WARNING: Your synergy is low. Download more synergy? (4.2 MB, 47 minutes at 14.4 kbps)',
  'HOT SINGLE RECRUITERS in your area want to ghost you!',
  'Your free trial of Being Employed has expired.',
  'Error: work-life balance not found.',
  'Installing LinkedIn Toolbar 3.1 for Internet Explorer...',
  'You have (1) new endorsement for Microsoft Paint.',
  'Gary from Synergy Corp REALLY wants to connect.',
  'Your boss is typing...',
]
const MAX = 20

// Once per page load, at 2 minutes: Win95 pop-ups pile up (OK makes one more), then HAPPY99.EXE takes the career.
// Escape clears everything at any time.
function VirusPopups() {
  const [phase, setPhase] = useState<'wait' | 'spam' | 'final' | 'gone'>('wait')
  // Pop-ups never close one by one, so the index is a stable id.
  const [pops, setPops] = useState<{ x: number; y: number }[]>([])
  // Every pop-up dings, so 20 of them stack into the classic error-sound pile-up.
  const spawn = () => { sfx.error(); setPops(p => (p.length >= MAX ? p : [...p, { x: Math.random(), y: Math.random() }])) }

  useEffect(() => {
    if (phase !== 'wait') return
    const t = setTimeout(() => setPhase('spam'), 2 * 60 * 1000)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'spam') return
    const t = setInterval(spawn, 300)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (phase === 'spam' && pops.length >= MAX) { setPhase('final'); sfx.tada() }
  }, [phase, pops.length])

  useEffect(() => {
    if (phase !== 'spam' && phase !== 'final') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPhase('gone') }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [phase])

  if (phase !== 'spam' && phase !== 'final') return null
  return (
    <>
      {pops.map((p, i) => (
        <div key={i} className="virus window" style={{ left: `max(0px, ${p.x} * (100vw - 260px))`, top: `max(0px, ${p.y} * (100dvh - 140px))` }}>
          <div className="titlebar"><span>Microsoft Internet Explorer</span></div>
          <div className="dialog-body"><span className="dialog-icon" aria-hidden="true">!</span><p>{SPAM[i % SPAM.length]}</p></div>
          <div className="buttons"><button type="button" onClick={spawn}>OK</button></div>
        </div>
      ))}
      {phase === 'final' && (
        <div className="virus virus-final window" role="alertdialog" aria-labelledby="virus-title" aria-describedby="virus-msg">
          <div className="titlebar"><span id="virus-title">HAPPY99.EXE</span></div>
          <div className="dialog-body">
            <span className="dialog-icon" aria-hidden="true">X</span>
            <p id="virus-msg">HAPPY99.EXE has deleted your career.<br />Profile set to "Open to Work". Happy 1999!</p>
          </div>
          <div className="buttons"><button type="button" className="default" autoFocus onClick={() => setPhase('gone')}>OK</button></div>
        </div>
      )}
    </>
  )
}
