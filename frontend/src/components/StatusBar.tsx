import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const Ctx = createContext<(msg: string) => void>(() => {})
export const useStatus = () => useContext(Ctx)

// Status bar "AI" spam: append "AI" every 2s in spam phases, silence in pause phases.
function useAiSpam(append: () => void) {
  useEffect(() => {
    const MIN = 60000
    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const timers: ReturnType<typeof setTimeout>[] = []
    const later = (fn: () => void, ms: number) => { timers.push(setTimeout(fn, ms)) }
    const spam = (duration: number, next: () => void) => {
      const t = setInterval(append, 2000)
      timers.push(t)
      later(() => { clearInterval(t); next() }, duration)
    }
    const pause = (duration: number, next: () => void) => later(next, duration)
    const cycle = () => {
      const pauseMin = rand(4, 8)
      const spamMin = rand(1, pauseMin - 1)
      pause(pauseMin * MIN, () => spam(spamMin * MIN, cycle))
    }
    spam(20 * 1000, () => pause(3 * MIN, () => spam(10 * MIN, cycle)))
    return () => timers.forEach(t => { clearTimeout(t); clearInterval(t) })
  }, [append])
}

export function StatusProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('Document: Done')
  const [append] = useState(() => () => setMsg(m => m + 'AI'))
  useAiSpam(append)
  return (
    <Ctx.Provider value={setMsg}>
      {children}
      <div className="statusbar window" role="status">
        <span className="msg">{msg}</span>
        <span className="meter" aria-hidden="true"><span /></span>
        <span>Local file</span>
      </div>
    </Ctx.Provider>
  )
}
