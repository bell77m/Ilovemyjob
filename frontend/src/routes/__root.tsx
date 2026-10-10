/// <reference types="vite/client" />
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Ads } from '../components/Ads'
import { ErrorDialogProvider } from '../components/ErrorDialog'
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

function RootLayout() {
  const [queryClient] = useState(() => new QueryClient())
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
                  <span className="tb-btns" aria-hidden="true"><span className="tb-btn" /><span className="tb-btn" /><span className="tb-btn" /></span>
                </div>
                <div className="window-body">
                  <div className="page">
                    <header className="center">
                      <h1 className="wordart">Ilovemyjob</h1>
                      <p>Welcome to the <b>LinkedIn Translator</b>! Type a normal sentence and get peak LinkedIn speak.</p>
                      <hr className="rainbow" />
                      <nav className="nav" aria-label="Mode">
                        <Link to="/">Make It Professional&trade;</Link>
                        <Link to="/decrypt">Decrypt Recruiter</Link>
                      </nav>
                    </header>
                    <main><Outlet /></main>
                    <footer className="center">
                      <hr />
                      <p className="small">You are visitor number 0001337</p>
                      <p className="small">Last updated: 10/10/26 &middot; <a href="mailto:webmaster@example.com">E-mail the webmaster</a></p>
                      <div className="badges">
                        <a href="#top"><span className="b88 b-best"><span>Best viewed at</span><span>800 x 600</span></span></a>
                        <a href="#top"><span className="b88 b-pad"><span>Made with</span><span>Notepad</span></span></a>
                        <a href="#top"><span className="b88 b-free"><span>Get a FREE</span><span>homepage!</span></span></a>
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
