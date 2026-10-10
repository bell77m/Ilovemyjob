import { useEffect, useState } from 'react'

// One-time jump scare: full-page haunted house at 5 minutes, gone after 1 second.
export function JumpScare() {
  const [phase, setPhase] = useState<'wait' | 'show' | 'gone'>('wait')
  useEffect(() => {
    const show = setTimeout(() => setPhase('show'), 5 * 60 * 1000)
    const hide = setTimeout(() => setPhase('gone'), 5 * 60 * 1000 + 1000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [])
  if (phase !== 'show') return null
  return <img className="scare" src="/images/haunted-house.jpg" alt="Silhouette of a haunted house with lit windows and a dead tree" />
}
