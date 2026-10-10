import { useEffect, useState } from 'react'
import { muted, sfx } from '../lib/sfx'

// Both buttons always lead to the same next tip. Clippy does not take no for an answer.
const TIPS = [
  { text: "It looks like you're trying to claim a prize. Would you like help?", a: 'Yes', b: 'Yes, but louder' },
  { text: 'Great! Your prize is a 15-minute call with a recruiter who has not read your resume.', a: 'Accept', b: 'Accept anyway' },
  { text: 'Tip: recruiters read a resume in 6 seconds. Try making yours 6 seconds long.', a: 'Thanks, Clippy', b: 'Please stop' },
  { text: "It looks like you're about to be laid off. Should I draft a \"Thrilled to announce\" post?", a: 'Yes', b: 'Also yes' },
  { text: "Done! I endorsed you for Microsoft Clippy. Gary from Synergy Corp is typing...", a: 'OK', b: 'Hide forever' },
]

// Say it out loud, Microsoft Agent style. Respects the Sound toggle; silent where speech is missing.
function say(text: string) {
  try {
    speechSynthesis.cancel()
    if (muted()) return
    const u = new SpeechSynthesisUtterance(text)
    u.pitch = 1.5
    speechSynthesis.speak(u)
  } catch { /* no speech support */ }
}

// Office 97 assistant, summoned by `dispatchEvent(new Event('clippy'))` (every "claim prize" / "upgrade" button).
export function Clippy() {
  const [step, setStep] = useState(-1)
  const tip = TIPS[step]

  useEffect(() => {
    const open = () => { setStep(0); sfx.boing() }
    addEventListener('clippy', open)
    return () => removeEventListener('clippy', open)
  }, [])

  useEffect(() => {
    if (!tip) { try { speechSynthesis.cancel() } catch { /* no speech support */ } return }
    say(tip.text)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setStep(-1) }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [tip])

  if (!tip) return null
  const next = () => setStep(s => (s + 1 < TIPS.length ? s + 1 : -1))
  return (
    <div className="clippy" role="dialog" aria-label="Clippy, your career assistant">
      <div className="clippy-bubble">
        <p aria-live="polite">{tip.text}</p>
        <div className="buttons">
          <button type="button" className="default" autoFocus onClick={next}>{tip.a}</button>
          <button type="button" onClick={next}>{tip.b}</button>
        </div>
      </div>
      <svg width="60" height="90" viewBox="0 0 60 90" aria-hidden="true">
        <path d="M18 84V24a12 12 0 0 1 24 0v48a7 7 0 0 1-14 0V30" fill="none" stroke="#808080" strokeWidth="5" strokeLinecap="round" />
        <path d="M12 14l10 4M48 14l-10 4" stroke="#000" strokeWidth="2" />
        <circle cx="21" cy="26" r="7" fill="#fff" stroke="#000" />
        <circle cx="39" cy="26" r="7" fill="#fff" stroke="#000" />
        <circle cx="23" cy="27" r="3" />
        <circle cx="41" cy="27" r="3" />
      </svg>
    </div>
  )
}
