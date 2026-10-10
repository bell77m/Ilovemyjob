// Start server functions: the only door from the browser to Ollama.
// Dynamic import keeps node:fs and the engine out of the client bundle.
import { createServerFn } from '@tanstack/react-start'

const server = () => import('./engine')

export const indexCorpus = createServerFn({ method: 'POST' })
  .handler(async () => (await server()).engine.index())

export const getBuzzwords = createServerFn({ method: 'GET' })
  .handler(async () => (await server()).cfg.buzzwords)

export const translate = createServerFn({ method: 'POST' })
  .inputValidator((d: { text: string; cringe: number; reverse: boolean }) => d)
  .handler(async function* ({ data }) {
    yield* (await server()).engine.translate(data)
  })
