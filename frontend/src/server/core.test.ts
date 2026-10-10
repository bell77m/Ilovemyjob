import { expect, test } from 'vitest'
import { SLOW, UNEMPLOYED, createEngine, type Config, type Event } from './core'

const cfg: Config = {
  ollama: 'http://ollama', model: 'llm', embedModel: 'emb', temperature: 0.9,
  system: 'SYS', reverseSystem: 'REV', buzzwords: ['synergy'],
}
const corpus = [
  { human: 'I got fired.', linkedin: 'Thrilled to announce.' },
  { human: 'I ate a sandwich.', linkedin: 'Layers in synergy.' },
  { human: 'I overslept.', linkedin: 'Chose rest.' },
  { human: 'It is raining.', linkedin: 'Growth needs storms.' },
]

const ndjson = (...chunks: string[]) => new ReadableStream<Uint8Array>({
  start(c) { for (const s of chunks) c.enqueue(new TextEncoder().encode(s)); c.close() },
})

type Opts = { embed?: () => Response | Promise<Response>; generate?: () => Response | Promise<Response> }
function fakeFetch(opts: Opts = {}) {
  const calls = { embed: 0, generate: [] as any[] }
  const f = (async (url: string, init: RequestInit) => {
    const body = JSON.parse(init.body as string)
    if (url.endsWith('/api/embed')) {
      calls.embed++
      if (opts.embed) return opts.embed()
      // corpus i -> [1, i]; query -> [1, 0], so pair 0 ranks first
      const vecs = body.input.map((t: string, i: number) => t.startsWith('search_query: ') ? [1, 0] : [1, i])
      return Response.json({ embeddings: vecs })
    }
    calls.generate.push(body)
    if (opts.generate) return opts.generate()
    return new Response(ndjson('{"response":"Grateful"}\n{"response":" journey"}\n', '{"done":true}\n'))
  }) as unknown as typeof fetch
  return { f, calls }
}

async function collect(gen: AsyncGenerator<Event>) {
  const out: Event[] = []
  for await (const e of gen) out.push(e)
  return out
}

const run = (f: typeof fetch, input = { text: 'I got fired.', cringe: 7, reverse: false }) =>
  collect(createEngine({ fetch: f, cfg, corpus }).translate(input))

test('translate yields sources then tokens then done', async () => {
  const ev = await run(fakeFetch().f)
  expect(ev.map(e => e.type)).toEqual(['sources', 'token', 'token', 'done'])
  expect((ev[0] as any).examples[0].human).toBe('I got fired.')
  expect(ev.filter(e => e.type === 'token').map((e: any) => e.text).join('')).toBe('Grateful journey')
})

test('forward prompt uses system prompt and cringe level', async () => {
  const { f, calls } = fakeFetch()
  await run(f, { text: 'I overslept.', cringe: 9, reverse: false })
  expect(calls.generate[0].system).toBe('SYS')
  expect(calls.generate[0].prompt).toMatch(/Cringe level: 9\/10\nHuman text: I overslept\.$/)
  expect(calls.generate[0].stream).toBe(true)
})

test('reverse prompt uses reverseSystem and linkedin side', async () => {
  const { f, calls } = fakeFetch()
  await run(f, { text: 'Thrilled.', cringe: 7, reverse: true })
  expect(calls.generate[0].system).toBe('REV')
  expect(calls.generate[0].prompt).toMatch(/^LinkedIn: .*\nHuman: /)
  expect(calls.generate[0].prompt).toMatch(/LinkedIn post: Thrilled\.$/)
})

test('input is cut to 500', async () => {
  const { f, calls } = fakeFetch()
  await run(f, { text: 'x'.repeat(600), cringe: 7, reverse: false })
  expect(calls.generate[0].prompt).toMatch(/Human text: x{500}$/)
})

test('cringe is clamped', async () => {
  const { f, calls } = fakeFetch()
  await run(f, { text: 'hi', cringe: 99, reverse: false })
  expect(calls.generate[0].prompt).toContain('Cringe level: 10/10')
})

test('empty text yields error event', async () => {
  const { f, calls } = fakeFetch()
  expect(await run(f, { text: '   ', cringe: 7, reverse: false })).toEqual([{ type: 'error', message: 'text is empty' }])
  expect(calls.generate).toHaveLength(0)
})

test('ollama down yields unemployed error', async () => {
  const f = (async () => { throw new TypeError('fetch failed') }) as unknown as typeof fetch
  const ev = await run(f)
  expect(ev.at(-1)).toEqual({ type: 'error', message: UNEMPLOYED })
})

test('http error yields Ollama said with error field', async () => {
  const { f } = fakeFetch({ generate: () => Response.json({ error: 'model not found' }, { status: 404 }) })
  expect((await run(f)).at(-1)).toEqual({ type: 'error', message: 'Ollama said: model not found' })
})

test('timeout yields slow error', async () => {
  const { f } = fakeFetch({ generate: () => { throw new DOMException('timed out', 'TimeoutError') } })
  expect((await run(f)).at(-1)).toEqual({ type: 'error', message: SLOW })
})

test('stream error after tokens yields error event', async () => {
  const { f } = fakeFetch({ generate: () => new Response(ndjson('{"response":"Hi"}\n{"error":"boom"}\n')) })
  const ev = await run(f)
  expect(ev.map(e => e.type)).toEqual(['sources', 'token', 'error'])
  expect(ev.at(-1)).toEqual({ type: 'error', message: 'Ollama said: boom' })
})

test('last line without newline is parsed', async () => {
  const { f } = fakeFetch({ generate: () => new Response(ndjson('{"response":"Hi"}\n{"response":" there","done":true}')) })
  const tokens = (await run(f)).filter(e => e.type === 'token').map((e: any) => e.text)
  expect(tokens.join('')).toBe('Hi there')
})

test('emoji split across chunks stays intact', async () => {
  const bytes = new TextEncoder().encode('{"response":"🚀"}\n')
  const body = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(bytes.slice(0, 15)); c.enqueue(bytes.slice(15)); c.close() } })
  const { f } = fakeFetch({ generate: () => new Response(body) })
  expect((await run(f)).find(e => e.type === 'token')).toEqual({ type: 'token', text: '🚀' })
})

// Endless Ollama stream that records whether we hung up on it.
function endless() {
  const state = { cancelled: false }
  const body = new ReadableStream<Uint8Array>({
    async pull(c) { await new Promise(r => setTimeout(r, 5)); c.enqueue(new TextEncoder().encode('{"response":"x"}\n')) },
    cancel() { state.cancelled = true },
  })
  return { state, body }
}

test('client abort cancels the Ollama stream', async () => {
  const { state, body } = endless()
  const { f } = fakeFetch({ generate: () => new Response(body) })
  const ac = new AbortController()
  const gen = createEngine({ fetch: f, cfg, corpus }).translate({ text: 'hi', cringe: 7, reverse: false }, ac.signal)
  const seen: string[] = []
  for await (const e of gen) {
    seen.push(e.type)
    if (e.type === 'token') ac.abort()
  }
  expect(state.cancelled).toBe(true)
  expect(seen.at(-1)).toBe('error')
})

test('stopping the generator early cancels the Ollama stream', async () => {
  const { state, body } = endless()
  const { f } = fakeFetch({ generate: () => new Response(body) })
  for await (const e of createEngine({ fetch: f, cfg, corpus }).translate({ text: 'hi', cringe: 7, reverse: false })) {
    if (e.type === 'token') break
  }
  expect(state.cancelled).toBe(true)
})

test('embed failure still yields tokens with no examples', async () => {
  const { f } = fakeFetch({ embed: () => Response.json({ error: 'model not found' }, { status: 404 }) })
  const ev = await run(f)
  expect(ev[0]).toEqual({ type: 'sources', examples: [] })
  expect(ev.at(-1)).toEqual({ type: 'done' })
})

test('failed index is retried', async () => {
  let fail = true
  const { f } = fakeFetch({ embed: () => fail ? Response.json({ error: 'nope' }, { status: 404 }) : Response.json({ embeddings: corpus.map(() => [1, 0]) }) })
  const engine = createEngine({ fetch: f, cfg, corpus })
  await expect(engine.index()).rejects.toThrow('Ollama said: nope')
  fail = false
  await expect(engine.index()).resolves.toEqual({ count: 4 })
})

test('concurrent index calls embed once', async () => {
  const { f, calls } = fakeFetch()
  const engine = createEngine({ fetch: f, cfg, corpus })
  await Promise.all([engine.index(), engine.index(), engine.index()])
  expect(calls.embed).toBe(1)
})
