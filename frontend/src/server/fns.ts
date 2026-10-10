// Start server functions for the small calls. Translation streams via routes/api/translate.ts.
// Dynamic import keeps node:fs and the engine out of the client bundle.
import { createServerFn } from '@tanstack/react-start'

const server = () => import('./engine')

export const indexCorpus = createServerFn({ method: 'POST' })
  .handler(async () => (await server()).engine.index())

export const getBuzzwords = createServerFn({ method: 'GET' })
  .handler(async () => (await server()).cfg.buzzwords)
