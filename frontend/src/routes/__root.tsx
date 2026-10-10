/// <reference types="vite/client" />
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AD_URL, Ads } from '../components/Ads'
import { ErrorDialogProvider, useErrorDialog } from '../components/ErrorDialog'
import { IndexStatus } from '../components/IndexStatus'
import { JumpScare } from '../components/JumpScare'
import { StatusProvider } from '../components/StatusBar'
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
                    <header className="center">
                      <h1 className="wordart">Ilovemyjob</h1>
                      <p>Welcome to the <b>LinkedIn Translator</b>! Type a normal sentence and get peak LinkedIn speak.</p>
                      <hr className="rainbow" />
                      <div className="ticker" role="marquee" aria-label="LinkedIn news"><span>{TICKER}</span></div>
                      <nav className="nav" aria-label="Mode">
                        <Link to="/">Make It Professional&trade;</Link>
                        <Link to="/decrypt">Decrypt Recruiter</Link>
                      </nav>
                    </header>
                    <main><Outlet /></main>
                    <footer className="center">
                      <hr />
                      <p className="small">You are visitor number <VisitorCounter /></p>
                      <p className="small">Last updated: 10/10/26 &middot; <a href="mailto:webmaster@example.com">E-mail the webmaster</a></p>
                      <div className="badges">
                        {/* One-way until reload: the page vanishes, cursor too */}
                        <a href="#top" onClick={e => { e.preventDefault(); document.documentElement.classList.add('vanished') }}><span className="b88 b-best"><span>Best viewed at</span><span>800 x 600</span></span></a>
                        {/* Filter on <html>, not <body>, so the fixed ads still float against the viewport */}
                        <a href="#top" onClick={e => { e.preventDefault(); document.documentElement.style.filter = 'grayscale(1)' }}><span className="b88 b-pad"><span>Made with</span><span>Notepad</span></span></a>
                        <a href={AD_URL}><span className="b88 b-free"><span>Get a FREE</span><span>homepage!</span></span></a>
                      </div>
                    </footer>
                  </div>
                </div>
              </div>
            </StatusProvider>
            <Ads />
            <JumpScare />
          </ErrorDialogProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
