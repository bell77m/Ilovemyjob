/// <reference types="vite/client" />
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { type ReactNode, useEffect, useState } from 'react'
import { AD_URL, Ads, BannerAd, MemeAds, Skyscrapers } from '../components/Ads'
import { Clippy } from '../components/Clippy'
import { ErrorDialogProvider, useErrorDialog } from '../components/ErrorDialog'
import { IndexStatus } from '../components/IndexStatus'
import { JumpScare } from '../components/JumpScare'
import { StatusProvider } from '../components/StatusBar'
import { muted, setMuted, sfx } from '../lib/sfx'
import css from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Ilovemyjob - LinkedIn Translator' },
    ],
    links: [{ rel: 'stylesheet', href: css }],
  }),
  component: RootLayout,
})

const TICKER = 'BREAKING: Local man "humbled" for the 47th time this week +++ Gary endorsed you for Microsoft Word +++ 3 recruiters viewed your profile and chose violence +++ You appeared in 0 searches this week +++ Your CEO posted about work-life balance at 3:12 AM +++ '
const QUIT = {
  minimize: 'Minimizing your impact is not one of our core values.',
  maximize: 'You are already at 110%. There is no further maximum.',
  close: "You can't quit. You love your job.",
}

// Title-bar buttons that refuse to do their job, just like you.
function WindowButtons() {
  const showError = useErrorDialog()
  return (
    <span className="tb-btns">
      {(Object.keys(QUIT) as (keyof typeof QUIT)[]).map(k => (
        <button key={k} type="button" className={`tb-btn tb-${k}`} aria-label={k} onClick={() => showError(QUIT[k])} />
      ))}
    </span>
  )
}

// Visitor counter that grows like your follower count wishes it did.
function VisitorCounter() {
  const [n, setN] = useState(1337)
  useEffect(() => {
    const t = setInterval(() => setN(v => v + 1 + Math.floor(Math.random() * 50)), 1000)
    return () => clearInterval(t)
  }, [])
  return <>{String(n).padStart(7, '0')}</>
}

const ENDORSERS = ['Gary from Synergy Corp', 'Your ex-manager', 'A bot named Brenda', 'Your mom', 'Chad, Founder & CEO of Chad', 'Someone you met once at a bus stop']
const SKILLS = ['Microsoft Paint', 'Breathing', 'Reply All', 'Meetings That Could Have Been Emails', 'Synergy', 'Pivoting', 'Being Humbled', 'Typing']
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)]

const GUESTBOOK = 'Guestbook is full. 4,812 recruiters signed it to say they "came across your profile".'

// 90s footer kit: guestbook that is always full, and a webring that only knows one site.
function Webring() {
  const showError = useErrorDialog()
  return (
    <>
      <p className="small"><a href="#guestbook" onClick={e => { e.preventDefault(); showError(GUESTBOOK) }}>Sign my guestbook!</a></p>
      <p className="small webring">
        [ <a href={AD_URL}>&laquo; Prev</a> | <b>Thought Leaders Webring</b> | <a href={AD_URL}>Random</a> | <a href={AD_URL}>Next &raquo;</a> ]
      </p>
    </>
  )
}

// 32px Win95-style desktop icons, drawn as tiny SVGs
const ICON: Record<string, ReactNode> = {
  pc: <><rect x="4" y="3" width="24" height="18" fill="#c0c0c0" stroke="#000" /><rect x="7" y="6" width="18" height="12" fill="#008080" /><rect x="10" y="22" width="12" height="3" fill="#808080" /><rect x="4" y="25" width="24" height="4" fill="#c0c0c0" stroke="#000" /></>,
  bin: <><rect x="8" y="9" width="16" height="20" fill="#dfdfdf" stroke="#000" /><rect x="6" y="5" width="20" height="4" fill="#c0c0c0" stroke="#000" /><path d="M12 12v14M16 12v14M20 12v14" stroke="#808080" /></>,
  doc: <><path d="M7 2h13l6 6v22H7z" fill="#fff" stroke="#000" /><path d="M20 2v6h6" fill="#c0c0c0" stroke="#000" /><path d="M10 13h13M10 17h13M10 21h13M10 25h9" stroke="#000080" /></>,
  net: <><rect x="2" y="4" width="12" height="10" fill="#c0c0c0" stroke="#000" /><rect x="18" y="4" width="12" height="10" fill="#c0c0c0" stroke="#000" /><rect x="10" y="19" width="12" height="10" fill="#c0c0c0" stroke="#000" /><path d="M8 14v4h16v-4M16 18v1" fill="none" stroke="#000" /></>,
  exe: <><rect x="3" y="5" width="26" height="22" fill="#c0c0c0" stroke="#000" /><rect x="4" y="6" width="24" height="5" fill="#000080" /><text x="16" y="23" textAnchor="middle" fontSize="11" fontFamily="Arial Black,Arial" fill="#cc0000">$$</text></>,
  mail: <><rect x="3" y="8" width="26" height="17" fill="#fff" stroke="#000" /><path d="M3 8l13 10 13-10" fill="none" stroke="#000" /><circle cx="26" cy="9" r="5" fill="#cc0000" /></>,
  xls: <><path d="M7 2h13l6 6v22H7z" fill="#fff" stroke="#000" /><path d="M10 12h13v14H10zM10 17h13M10 22h13M16 12v14" fill="none" stroke="#008000" /></>,
  dir: <><path d="M3 9h10l2 3h14v16H3z" fill="#ffd700" stroke="#000" /><path d="M3 12h26" stroke="#b8860b" /></>,
}
const DESKTOP = [
  { icon: 'pc', label: 'My Computer', msg: 'My Computer belongs to the company. IT can see this.' },
  { icon: 'bin', label: 'Recycle Bin', msg: 'Recycle Bin contains: 1 career, 3 side hustles and your work-life balance. Empty it?' },
  { icon: 'doc', label: 'Resume_FINAL_v7(2).doc', msg: 'Resume_FINAL_v7(2).doc is open in another program: ATS Auto-Reject 3.1.' },
  { icon: 'net', label: 'Network Neighborhood', msg: 'Network Neighborhood: 500+ connections, 0 friends.' },
  { icon: 'exe', label: 'HUSTLE.EXE', msg: 'HUSTLE.EXE has performed an illegal operation and will be promoted to manager.' },
  { icon: 'mail', label: 'Inbox (1,204)', msg: 'You have 1,204 unread messages. All of them say "Quick question".' },
  { icon: 'xls', label: 'Salary.xls', msg: 'Salary.xls is 0 KB. That is not a bug.' },
  { icon: 'dir', label: 'C:\\Dreams', msg: 'C:\\Dreams is empty. Contents moved to C:\\Deadlines.' },
]

// Desktop icons in the bare teal between the page and the side columns (wide screens only)
function DesktopIcons() {
  const showError = useErrorDialog()
  return (
    <>
      {[DESKTOP.slice(0, 4), DESKTOP.slice(4)].map((col, i) => (
        <div key={i} className={`desktop desktop-${i ? 'right' : 'left'}`}>
          {col.map(d => (
            <button key={d.label} type="button" className="desk-icon" onClick={() => showError(d.msg)}>
              <svg width="32" height="32" viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">{ICON[d.icon]}</svg>
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      ))}
    </>
  )
}

// Endorsements nobody asked for, from people you don't know, for skills you don't have.
function Endorsements() {
  const [msg, setMsg] = useState('')
  useEffect(() => {
    let hide: ReturnType<typeof setTimeout> | undefined
    const show = () => {
      setMsg(`${pick(ENDORSERS)} endorsed you for ${pick(SKILLS)}.`)
      sfx.uhOh()
      clearTimeout(hide); hide = setTimeout(() => setMsg(''), 6000)
    }
    const first = setTimeout(show, 8000), t = setInterval(show, 20000)
    return () => { clearTimeout(first); clearInterval(t); clearTimeout(hide) }
  }, [])
  if (!msg) return null
  return (
    <div className="toast window" role="status">
      <div className="titlebar"><span>New Endorsement!</span></div>
      <p>{msg}</p>
    </div>
  )
}

// Sound on/off. Starts on; the choice is remembered.
function SoundToggle() {
  const [off, setOff] = useState(false)
  useEffect(() => setOff(muted()), []) // localStorage does not exist during SSR
  return (
    <button type="button" onClick={() => { setMuted(!off); setOff(!off) }}>
      Sound: {off ? 'OFF' : 'ON'}
    </button>
  )
}

const SPARKLE = ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#fff']
// 1998 cursor trail: colored stars fall off the mouse. Mouse only, and off under reduced motion.
function useSparkles() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let last = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.timeStamp - last < 50) return
      last = e.timeStamp
      const s = document.createElement('span')
      s.className = 'sparkle'
      s.textContent = '*'
      s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;color:${pick(SPARKLE)}`
      s.onanimationend = () => s.remove()
      document.body.append(s)
    }
    addEventListener('pointermove', onMove)
    return () => removeEventListener('pointermove', onMove)
  }, [])
}

// Leave the tab and it begs you to come back.
function useGuiltTrip() {
  useEffect(() => {
    let title = document.title
    const onChange = () => {
      if (document.hidden) { title = document.title; document.title = '(3) Your network misses you 🥺' }
      else document.title = title
    }
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
}

function RootLayout() {
  const [queryClient] = useState(() => new QueryClient())
  useGuiltTrip()
  useSparkles()
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ErrorDialogProvider>
            <StatusProvider>
              <IndexStatus />
              <div className="window" role="application" aria-labelledby="app-title">
                <div className="titlebar">
                  <span id="app-title">Ilovemyjob - LinkedIn Translator</span>
                  <WindowButtons />
                </div>
                <div className="window-body">
                  <div className="page">
                    <BannerAd />
                    <header className="center">
                      <h1 className="wordart">Ilovemyjob</h1>
                      <p>Welcome to the <b>LinkedIn Translator</b>! Type a normal sentence and get peak LinkedIn speak.</p>
                      <div className="construction"><span>Under Construction! Just like my personal brand.</span></div>
                      <hr className="rainbow" />
                      <div className="ticker" role="marquee" aria-label="LinkedIn news"><span>{TICKER}</span></div>
                      <nav className="nav" aria-label="Mode">
                        <Link to="/">Make It Professional&trade;</Link>
                        <Link to="/decrypt">Decrypt Recruiter <span className="blink">NEW!</span></Link>
                      </nav>
                    </header>
                    <main><Outlet /></main>
                    <footer className="center">
                      <hr />
                      <BannerAd start={2} />
                      <Webring />
                      <p className="small">You are visitor number <VisitorCounter /> &middot; <SoundToggle /></p>
                      <p className="small">Last updated: 10/10/26 &middot; <a href="mailto:webmaster@example.com">E-mail the webmaster</a></p>
                      <div className="badges">
                        {/* One-way until reload: the page vanishes, cursor too */}
                        <a href="#top" onClick={e => { e.preventDefault(); document.documentElement.classList.add('vanished') }}><span className="b88 b-best"><span>Best viewed at</span><span>800 x 600</span></span></a>
                        {/* Filter on <html>, not <body>, so the fixed ads still float against the viewport */}
                        <a href="#top" onClick={e => { e.preventDefault(); document.documentElement.style.filter = 'grayscale(1)' }}><span className="b88 b-pad"><span>Made with</span><span>Notepad</span></span></a>
                        {/* Not compliant: the page falls apart (PageCollapse in JumpScare.tsx) */}
                        <a href="#top" onClick={e => { e.preventDefault(); dispatchEvent(new Event('collapse')) }}><span className="b88 b-y2k"><span>Y2K</span><span>Compliant!</span></span></a>
                        <a href={AD_URL}><span className="b88 b-free"><span>Get a FREE</span><span>homepage!</span></span></a>
                      </div>
                    </footer>
                  </div>
                </div>
              </div>
            </StatusProvider>
            <DesktopIcons />
            <Skyscrapers />
            <Ads />
            <MemeAds />
            <Endorsements />
            <Clippy />
            <JumpScare />
          </ErrorDialogProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
