import { createFileRoute } from '@tanstack/react-router'

// POST /api/translate -> newline-delimited JSON events (sources, token..., done | error).
// A server route, not a server function: Start 1.168 does not tell server functions
// when the browser hangs up, but a route's request.signal and stream cancel() fire.
export const Route = createFileRoute('/api/translate')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { engine } = await import('../../server/engine')
        const input = await request.json().catch(() => ({}))
        const events = engine.translate(input, request.signal)
        const enc = new TextEncoder()
        const body = new ReadableStream<Uint8Array>({
          async pull(c) {
            const { value, done } = await events.next()
            if (done) c.close()
            else c.enqueue(enc.encode(JSON.stringify(value) + '\n'))
          },
          cancel() { events.return(undefined) },
        })
        return new Response(body, { headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store' } })
      },
    },
  },
})
