import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { enforceAgree, paywall, splitNdjson, type Pair } from '../lib/cringe'
import { dialUp } from '../lib/modem'
import { sfx } from '../lib/sfx'
import type { Event } from '../server/core'
import { getBuzzwords } from '../server/fns'
import { useErrorDialog } from './ErrorDialog'
import { Sources } from './Sources'
import { useStatus } from './StatusBar'
import { SynergyMeter } from './SynergyMeter'

// Dial-up first, then the usual LinkedIn humility. Long waits loop back to redialing.
const LOADING = ['Dialing 1-800-SYNERGY...', 'Handshaking at 14.4 kbps...', 'Connected at 14,400 bps.', 'Humbled to be generating...', 'Leveraging synergies...', 'Circling back...', 'Disrupting your request...']
const DODGE = ['Nice try.', 'Commitment issues?', 'Fine. Take it.']
const SERVER_DOWN = 'The server is unemployed. Run `npm run dev` in frontend/.'

type Result = { text: string; examples: Pair[]; engage: string; premium: boolean }

// One translator for both pages. reverse = Decrypt Recruiter (LinkedIn post -> honest sentence).
export function Translator({ reverse }: { reverse: boolean }) {
  const setStatus = useStatus()
  const showError = useErrorDialog()
  const { data: words = [] } = useQuery({ queryKey: ['buzzwords'], queryFn: () => getBuzzwords(), staleTime: Infinity })
  const [out, setOut] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [copyOk, setCopyOk] = useState(false)
  // Copy button runs from the mouse 3 times, then gives up. Mouse only: touch and keyboard copy normally.
  const [dodge, setDodge] = useState({ n: 0, x: 0, y: 0 })
  // Leaving the page mid-stream hangs up; the server then stops Ollama too.
  const abortRef = useRef<AbortController | null>(null)
  // Every 3rd finished post hides its conclusion behind LinkedIn Premium 96.
  const posts = useRef(0)
  useEffect(() => {
    // pagehide also covers tab close and Chrome's back/forward cache, which can keep a fetch alive.
    const hangUp = () => abortRef.current?.abort()
    addEventListener('pagehide', hangUp)
    return () => { removeEventListener('pagehide', hangUp); hangUp() }
  }, [])

  const run = useMutation({
    mutationFn: async (input: { text: string; cringe: number }) => {
      setResult(null)
      setCopyOk(false)
      setDodge({ n: 0, x: 0, y: 0 })
      let started = false, i = 0, text = '', examples: Pair[] = []
      const tick = () => {
        const msg = LOADING[i++ % LOADING.length]
        setStatus(msg)
        if (!started) setOut(msg)
      }
      tick()
      const ticker = setInterval(tick, 1500)
      const hangUp = dialUp()
      const ac = new AbortController()
      abortRef.current = ac
      try {
        // Any network-level failure (server down, died mid-stream, 5xx) reads as SERVER_DOWN.
        const r = await fetch('/api/translate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...input, reverse }), signal: ac.signal,
        }).catch(e => { throw ac.signal.aborted ? e : new Error(SERVER_DOWN) })
        if (!r.ok || !r.body) throw new Error(SERVER_DOWN)
        const reader = r.body.pipeThrough(new TextDecoderStream()).getReader()
        let buf = '', finished = false
        while (!finished) {
          const chunk = await reader.read().catch(e => { throw ac.signal.aborted ? e : new Error(SERVER_DOWN) })
          let events: Event[]
          ;[events, buf] = splitNdjson(buf + (chunk.done ? '\n' : chunk.value))
          for (const ev of events) {
            if (ev.type === 'sources') examples = ev.examples
            else if (ev.type === 'error') throw new Error(ev.message)
            else if (ev.type === 'done') finished = true
            else {
              if (!started) { started = true; clearInterval(ticker); hangUp(); text = '' }
              text += ev.text
              setOut(text)
            }
          }
          if (chunk.done && !finished) throw new Error(SERVER_DOWN)
        }
      } catch (e) {
        if (!started) setOut('')
        throw e
      } finally {
        clearInterval(ticker)
        hangUp()
      }
      const final = reverse ? text.trim() : enforceAgree(text)
      const n = (max: number) => Math.floor(Math.random() * max).toLocaleString('en-US')
      const premium = !reverse && ++posts.current % 3 === 0
      return { text: final, examples, premium, engage: reverse ? '' : `${n(9999)} reactions · ${n(999)} comments · ${n(99)} reposts` }
    },
    onSuccess: r => {
      setOut(r.text)
      setResult(r)
      setCopyOk(true)
      if (r.premium) sfx.kaching(); else sfx.tada()
      setStatus(r.examples.length ? 'Document: Done' : 'Sources: vibes only')
    },
    onError: (e: Error) => {
      if (e.name === 'AbortError') return // we left the page on purpose
      setStatus('Document: Error')
      showError(e.message)
    },
  })


  const form = useForm({
    defaultValues: { text: '', cringe: 7 },
    onSubmit: ({ value }) => run.mutate({ text: value.text.trim(), cringe: value.cringe }),
  })

  // localStorage can throw (private mode, blocked storage) and does not exist during SSR.
  useEffect(() => {
    try { if (localStorage.cringe) form.setFieldValue('cringe', +localStorage.cringe) } catch { /* slider still works */ }
  }, [form])

  // Premium posts copy without the conclusion. Pay up.
  const copy = () => navigator.clipboard.writeText(result?.premium ? paywall(out)[0] : out)
    .then(() => setStatus(result?.premium ? 'Copied. Conclusion sold separately.' : 'Copied. Friends lost: all.'))
    .catch(() => showError('Clipboard blocked. Select the post and press Ctrl+C.'))

  return (
    <>
      <form
        aria-labelledby="translate-heading"
        onSubmit={e => { e.preventDefault(); form.handleSubmit() }}
        noValidate
      >
        <h2 id="translate-heading">{reverse ? 'Decrypt Recruiter' : 'Translate'}</h2>
        <form.Field
          name="text"
          validators={{ onSubmit: ({ value }) => (value.trim() ? undefined : 'Please fill out this field.') }}
        >
          {field => (
            <div className="field">
              <label htmlFor="input-text"><b>{reverse ? 'Paste a LinkedIn post:' : 'What actually happened?'}</b></label>
              <textarea
                id="input-text" rows={4} maxLength={500}
                placeholder={reverse ? "Thrilled to announce I'm embarking on a new chapter... Agree?" : 'I got fired.'}
                value={field.state.value}
                onChange={e => { field.handleChange(e.target.value); sfx.key() }}
                onBlur={field.handleBlur}
                aria-invalid={field.state.meta.errors.length > 0}
                aria-describedby={field.state.meta.errors.length ? 'text-error' : undefined}
              />
              {field.state.meta.errors.length > 0 && <span id="text-error" className="small" role="alert">{field.state.meta.errors[0]}</span>}
            </div>
          )}
        </form.Field>
        {!reverse && (
          <form.Field name="cringe">
            {field => (
              <div className="field-row">
                <label htmlFor="cringe">Cringe level:</label>
                <input
                  id="cringe" type="range" min={1} max={11} value={field.state.value} aria-describedby="cringe-value"
                  onChange={e => {
                    field.handleChange(+e.target.value)
                    try { localStorage.cringe = e.target.value } catch { /* not remembered, still works */ }
                  }}
                />
                <span id="cringe-value">{field.state.value === 11 ? '11 (this one goes to eleven)' : field.state.value}</span>
              </div>
            )}
          </form.Field>
        )}
        <div className="buttons">
          <button type="submit" className="default" disabled={run.isPending}>
            {reverse ? 'Decrypt Recruiter' : <>Make It Professional&trade;</>}
          </button>
        </div>
      </form>

      <hr />

      <section aria-labelledby="output-heading">
        <h3 id="output-heading">{reverse ? 'What They Actually Mean' : 'Your LinkedIn Post'}</h3>
        <div className="output" aria-live="polite" aria-busy={run.isPending || undefined}>
          {result?.premium ? <>{paywall(out)[0]}<span className="redacted" aria-hidden="true">{paywall(out)[1]}</span></> : out}
        </div>
        {result?.premium && (
          <p className="small center">
            <b>Upgrade to LinkedIn Premium 96 for $49.95/mo to see the conclusion.</b>{' '}
            <button type="button" onClick={() => dispatchEvent(new Event('clippy'))}>Upgrade Now</button>
          </p>
        )}
        <p className="small">{result?.engage}</p>
        <div className="buttons" style={{ marginTop: 8 }}>
          <button
            type="button" disabled={!copyOk || run.isPending} onClick={copy}
            style={{ transform: `translate(${dodge.x}px, ${dodge.y}px)` }}
            onPointerEnter={e => {
              if (!copyOk || e.pointerType !== 'mouse' || dodge.n >= DODGE.length) return
              const r = () => Math.round((Math.random() - 0.5) * 160)
              setDodge({ n: dodge.n + 1, x: r(), y: r() / 4 })
              sfx.boing()
              setStatus(DODGE[dodge.n])
            }}
          >Copy to Clipboard</button>
        </div>
        <SynergyMeter text={result?.text ?? null} words={words} />
      </section>

      <Sources examples={result?.examples ?? null} reverse={reverse} />
    </>
  )
}
