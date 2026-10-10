/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
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
  component: () => (
    <html lang="en">
      <head><HeadContent /></head>
      <body><Outlet /><Scripts /></body>
    </html>
  ),
})
