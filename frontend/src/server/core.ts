// Server-side translator engine: RAG over cringe.json + streaming Ollama generate.
// Pure apart from the injected fetch, so tests run without Ollama. Wired to Start in fns.ts.
import { buildPrompt, topK, type Pair } from '../lib/cringe'

export type Config = {
  ollama: string; model: string; embedModel: string; temperature: number
  system: string; reverseSystem: string; buzzwords: string[]
}
export type Deps = { fetch: typeof fetch; cfg: Config; corpus: Pair[]; timeoutMs?: number }
export type Event =
  | { type: 'sources'; examples: Pair[] }
  | { type: 'token'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string }
type Side = 'human' | 'linkedin'

export const UNEMPLOYED = 'This program has performed an illegal operation: your LLM is unemployed. Run `ollama serve`.'
export const SLOW = 'Ollama is thinking too slowly (over 120 s). Try again, or use a smaller model or a GPU.'

class OllamaError extends Error {}

// fetch rejects on refused connection, and on abort when the timeout fires (also mid-stream).
const cannotReach = (e: unknown) => new OllamaError((e as Error)?.name === 'TimeoutError' ? SLOW : UNEMPLOYED)

// Ollama streams newline-delimited JSON; a network chunk can end mid-line.
export function splitNdjson(buf: string): [any[], string] {
  const lines = buf.split('\n')
  const rest = lines.pop() ?? ''
  return [lines.filter(l => l.trim()).map(l => JSON.parse(l)), rest]
}

export function createEngine({ fetch, cfg, corpus, timeoutMs = 120_000 }: Deps) {
  async function call(path: string, body: object) {
    let r: Response
    try {
      r = await fetch(cfg.ollama + path, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs),
      })
    } catch (e) { throw cannotReach(e) }
    if (!r.ok) {
      const t = await r.text()
      let msg = t
      try { msg = JSON.parse(t).error ?? t } catch { /* not JSON, show as is */ }
      throw new OllamaError('Ollama said: ' + msg)
    }
    return r
  }

  async function embed(texts: string[]): Promise<number[][]> {
    return (await (await call('/api/embed', { model: cfg.embedModel, input: texts })).json()).embeddings
  }

  // Corpus vectors per side, built once and shared by concurrent callers. A failure is not cached.
  const vecs = new Map<Side, Promise<number[][]>>()
  function vectors(side: Side) {
    let p = vecs.get(side)
    if (!p) {
      p = embed(corpus.map(c => 'search_document: ' + c[side]))
      vecs.set(side, p)
      p.catch(() => { if (vecs.get(side) === p) vecs.delete(side) })
    }
    return p
  }

  // RAG is a bonus: if embedding fails, translate with no examples ("vibes only").
  async function retrieve(text: string, side: Side): Promise<Pair[]> {
    try {
      const [docs, [q]] = await Promise.all([vectors(side), embed(['search_query: ' + text])])
      return topK(q, docs, 3).map(i => corpus[i])
    } catch {
      return []
    }
  }

  async function* translate(input: { text: string; cringe: number; reverse: boolean }): AsyncGenerator<Event> {
    // Trust boundary: the server function can be called without the form.
    const text = String(input.text ?? '').trim().slice(0, 500)
    if (!text) { yield { type: 'error', message: 'text is empty' }; return }
    const cringe = Math.min(10, Math.max(1, Math.round(Number(input.cringe)) || 7))
    const reverse = Boolean(input.reverse)
    const examples = await retrieve(text, reverse ? 'linkedin' : 'human')
    yield { type: 'sources', examples }
    try {
      const r = await call('/api/generate', {
        model: cfg.model, system: reverse ? cfg.reverseSystem : cfg.system,
        prompt: buildPrompt(text, cringe, examples, reverse),
        stream: true, options: { temperature: cfg.temperature },
      })
      const reader = r.body!.getReader()
      const decoder = new TextDecoder() // stream mode keeps multi-byte emoji intact across chunks
      let buf = ''
      for (;;) {
        let chunk: ReadableStreamReadResult<Uint8Array>
        try { chunk = await reader.read() } catch (e) { throw cannotReach(e) }
        buf += chunk.done ? decoder.decode() + '\n' : decoder.decode(chunk.value, { stream: true })
        let msgs: any[]
        ;[msgs, buf] = splitNdjson(buf)
        for (const m of msgs) {
          if (m.error) throw new OllamaError('Ollama said: ' + m.error)
          if (m.response) yield { type: 'token', text: m.response }
        }
        if (chunk.done) break
      }
      yield { type: 'done' }
    } catch (e) {
      yield { type: 'error', message: e instanceof OllamaError ? e.message : UNEMPLOYED }
    }
  }

  return {
    index: async () => ({ count: (await vectors('human')).length }),
    translate,
  }
}
