import { useEffect, useState } from 'react'

const TRIGGER = /\b(fired|quit|layoffs?|laid off|resign\w*|boss|manager)\b/i

// Corporate blue screen, once per page load: when the user types a trigger word, or at 5 minutes.
// No flashing (photosensitive-safe). Any key or click closes it.
export function JumpScare() {
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
