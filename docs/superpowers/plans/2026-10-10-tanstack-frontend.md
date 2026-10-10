# TanStack Frontend Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Ruling (plan author): the author executes this plan inline in the same session, right after writing it (user said "implement"). Logic tasks (2, 3) carry full code and tests here; UI tasks (4, 5) carry interfaces, behavior and checks, and the code lives in their commits rather than being written twice.

**Goal:** Replace `frontend/` (vanilla `index.html`) with a TanStack Start React app at full parity, with Ollama and RAG running in Start server functions.

**Architecture:** TanStack Start (Vite 8 + Nitro) serves the React app and server functions. `createServerFn` async generators stream NDJSON-like events (`sources`, `token`, `done`, `error`) to the client. Router gives `/` and `/decrypt`; Query runs the corpus index and translate mutation; Form owns input validation. Pure logic in `src/lib/cringe.ts` is shared by server and client.

**Tech Stack:** `@tanstack/react-start` 1.168.61, `@tanstack/react-router` 1.170.42, `@tanstack/react-query` 5.104.1, `@tanstack/react-form` 1.33.5, `react`/`react-dom` 19.3.0, `vite` 8.3.4, `@vitejs/plugin-react` 6.1.2, `nitro` 3.0.260903-beta, `typescript` 7.0.2, `vitest` 5.0.3, Node 24.

**Spec:** [docs/superpowers/specs/2026-10-10-tanstack-frontend-design.md](../specs/2026-10-10-tanstack-frontend-design.md)

## Global Constraints

- Exact version pins in `frontend/package.json` (no `^`).
- Spike verified (2026-10-10): `createServerFn({method:'POST'}).inputValidator(fn).handler(async function* ...)` streams incrementally in a production build; client reads with `for await (const ev of await fn({data}))`. Production: `vite build` → `node .output/server/index.mjs` (Nitro), `PORT` env sets the port.
- Server reads `../prompts.json` and `../cringe.json` relative to the repo root via `process.cwd()`-independent path: `new URL('../../../', import.meta.url)` is unreliable after bundling, so use env `ILMJ_ROOT` (default: parent of `process.cwd()` when cwd ends in `frontend`, else cwd).
- Ollama base URL: env `OLLAMA_HOST`, default `http://localhost:11434`. Never exposed to the browser.
- Error texts (verbatim): unemployed `This program has performed an illegal operation: your LLM is unemployed. Run \`ollama serve\`.`; slow `Ollama is thinking too slowly (over 120 s). Try again, or use a smaller model or a GPU.`; HTTP `Ollama said: <error field>`; server down `The server is unemployed. Run \`npm run dev\` in frontend/.`
- Input: text trimmed, required, max 500 (forward and reverse); cringe clamped 1–10.
- Model output and sources rendered as React text only. No `dangerouslySetInnerHTML`.
- UI follows `DESIGN.md`; CSS moved verbatim from the old `index.html`.
- Tests: Vitest, one behavior per test, named after it, no network.
- Each task ends with the `update-progress` skill and a Conventional Commit.

## Review Focus

1. Ollama down mid-stream (connection drops after some tokens): client shows partial text plus the error dialog, buttons re-enable. Owned by Task 3 test `stream error after tokens yields error event`.
2. Embed model missing: translation still streams, "Sources: vibes only", next request retries indexing. Task 3 tests `embed failure still yields tokens` and `failed index is retried`.
3. Two translations at once (double click / two tabs): no shared mutable stream state on the server; corpus index built once. Task 3 test `concurrent index calls embed once`.
4. Input over 500 chars or cringe out of range sent straight to the server function (bypassing the form): server cuts and clamps. Task 3 tests `input is cut to 500` and `cringe is clamped`.
5. Start server unreachable from the browser: dialog shows the server-down text, not a blank output. Task 5 browser check.

## File Map

| File | Task |
|---|---|
| `frontend/package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `src/router.tsx` | 1 |
| `frontend/legacy/` (old `index.html`, `lib.js`, `tests.*` moved here, deleted in Task 6) | 1, 6 |
| `frontend/public/images/*.jpg` | 1 |
| `frontend/src/styles.css` | 1 |
| `frontend/src/lib/cringe.ts`, `cringe.test.ts` | 2 |
| `frontend/src/server/core.ts`, `core.test.ts` (pure server logic, injectable fetch) | 3 |
| `frontend/src/server/fns.ts` (`createServerFn` wrappers) | 3 |
| `frontend/src/routes/__root.tsx`, `src/components/{Ads,JumpScare,StatusBar,ErrorDialog}.tsx` | 4 |
| `frontend/src/routes/index.tsx`, `decrypt.tsx`, `src/components/{Translator,Sources,SynergyMeter}.tsx` | 5 |
| `compose.yaml`, `compose.demo.yaml`, `frontend/Dockerfile`, delete `nginx.conf`, docs | 6 |

---

### Task 1: Scaffold Start app, move legacy page

**Files:** create `frontend/package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `src/router.tsx`, `src/routes/__root.tsx` (minimal), `src/routes/index.tsx` (placeholder heading), `src/styles.css`; move `frontend/{index.html,lib.js,tests.js,tests.html}` → `frontend/legacy/`; move `frontend/images/` → `frontend/public/images/`; `.gitignore` += `node_modules/`, `.output/`, `.tanstack/`, `.nitro/`.

**Produces:** `npm run dev` (port 3000), `npm run build`, `npm start`, `npm test` (vitest run).

- [ ] Step 1: write config files as in the spike (`vite.config.ts`: plugins `[tanstackStart(), nitro(), viteReact()]`, `server.port 3000`; scripts `dev`, `build`, `start: node .output/server/index.mjs`, `test: vitest run`).
- [ ] Step 2: `vitest.config.ts` with `test.include: ['src/**/*.test.ts']`, `environment: 'node'` (separate from the Start plugin so tests don't boot Start).
- [ ] Step 3: `npm install`; `npm run build`. Expected: exit 0, `.output/server/index.mjs` exists.
- [ ] Step 4: `PORT=3999 npm start`, `curl localhost:3999/` → 200, then stop it.
- [ ] Step 5: progress + commit `build: scaffold TanStack Start app in frontend/`.

### Task 2: Port pure logic to `src/lib/cringe.ts`

**Produces:**
```ts
export type Pair = { human: string; linkedin: string }
export function buildPrompt(text: string, cringe: number, examples: Pair[], reverse?: boolean): string
export function enforceAgree(text: string): string
export function cosine(a: number[], b: number[]): number
export function topK(q: number[], vecs: number[][], k: number): number[]
export function synergyScore(text: string, words: string[]): { score: number; buzzwords: string[] }
```
(`splitNdjson` stays server-only in Task 3; the client no longer parses NDJSON.)

- [ ] Step 1: `cringe.test.ts`: port every check from `legacy/tests.js` except `splitNdjson` ones as `test('<same name>', ...)` with `expect(...).toBe/toEqual`. 23 tests.
- [ ] Step 2: `npm test`. Expected: fails, `Cannot find module './cringe'`.
- [ ] Step 3: `cringe.ts`: same bodies as `legacy/lib.js` (typed).
- [ ] Step 4: `npm test`. Expected: 23 passed.
- [ ] Step 5: commit `feat: port translator logic to TypeScript`.

### Task 3: Server logic and server functions

**Produces (`core.ts`):**
```ts
export type Event =
  | { type: 'sources'; examples: Pair[] }
  | { type: 'token'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string }
export type Deps = { fetch: typeof fetch; cfg: Config; corpus: Pair[] }
export const UNEMPLOYED: string, SLOW: string
export function splitNdjson(buf: string): [any[], string]
export function createEngine(deps: Deps): {
  index(): Promise<{ count: number }>            // embeds corpus human side once; rejects on failure and clears cache
  translate(input: { text: string; cringe: number; reverse: boolean }): AsyncGenerator<Event>
}
```
**Produces (`fns.ts`):** `indexCorpus` (`createServerFn({method:'POST'})`, returns `{count}`), `translate` (`createServerFn({method:'POST'}).inputValidator(...)`, async generator yielding `Event`). Engine is a module singleton built from real `fetch`, `prompts.json`, `cringe.json`.

Tests (`core.test.ts`, fake fetch that routes `/api/embed` and `/api/generate`, with a `ReadableStream` body for generate):
- `translate yields sources then tokens then done`
- `forward prompt uses system prompt and cringe level`
- `reverse prompt uses reverseSystem and linkedin side`
- `input is cut to 500`
- `cringe is clamped`
- `empty text yields error event` (message `text is empty`)
- `ollama down yields unemployed error`
- `http error yields Ollama said with error field`
- `timeout yields slow error`
- `stream error after tokens yields error event` (body chunk `{"error":"boom"}`)
- `last line without newline is parsed`
- `embed failure still yields tokens with no examples`
- `failed index is retried`
- `concurrent index calls embed once`

- [ ] Step 1: write tests. Step 2: run, expect module-not-found. Step 3: implement `core.ts` (`AbortSignal.timeout(120_000)` on fetch; `TimeoutError` → SLOW; fetch rejection → UNEMPLOYED; `!r.ok` → parse `error` field; stream via `r.body` + `TextDecoder` + `splitNdjson`, flush leftover at end). Step 4: run, all pass. Step 5: `fns.ts`. Step 6: `npm run build` passes. Step 7: commit `feat: server-side Ollama engine with streaming server functions`.

### Task 4: Shell and jokes (parity)

**Produces:** `__root.tsx` renders the Netscape 96 window (title bar, WordArt header, rainbow hr, nav buttons "Make It Professional™" page `/` and "Decrypt Recruiter" page `/decrypt` via `<Link>`, footer counter + badges), `<StatusBar>` with a `useStatus()` context (`setStatus(msg)`) whose message gets "AI" appended by the spam schedule, `<Ads>` (4 ads, bounce/burst/cooldown/reopen, reduced motion), `<JumpScare>` (once at 5 min, 1 s), `<ErrorDialog>` via `useErrorDialog()` context (`showError(msg)`), `QueryClientProvider`.

Checks (browser): 800×600 screenshot matches old page look; 375 px no horizontal scroll; ads move and close; closing all brings them back after 12 s; `prefers-reduced-motion` keeps ads static.

- [ ] Steps: build components by porting the old inline scripts 1:1 into `useEffect`s; `npm run build`; browser checks; commit `feat: Netscape 96 shell with ads, AI spam and jump scare`.

### Task 5: Translator pages

**Produces:** `<Translator reverse={boolean}>` used by `/` (false) and `/decrypt` (true). TanStack Form fields `text` (required after trim, max 500) and `cringe` (1–10, `localStorage.cringe`, forward only). `useQuery(['corpus-index'], indexCorpus, {retry: 1})` in root drives status `Indexing thought leadership... n/n` or `Sources: vibes only`. `useMutation` runs the stream: loading messages rotate every 1.5 s until first token; tokens append; `done` → `enforceAgree` (forward) / `trim` (reverse), `<Sources>`, `<SynergyMeter>`, engagement line (forward only), copy enabled; `error` → `showError`. Output `aria-live="polite"`, `aria-busy` while streaming. Network failure → server-down text.

Checks (browser, live Ollama): "I got fired." streams token by token, 3 sources incl. the job-loss pair, ends with one "Agree?"; `/decrypt` turns a humblebrag into one honest sentence, no "Agree?" added; empty/space input shows a field error, sends nothing; Ollama stopped → dialog, buttons back; Start server stopped → server-down dialog; only `localhost` requests.

- [ ] Steps: build; browser checks; commit `feat: translator and decrypt pages on TanStack Query and Form`.

### Task 6: Docker, cleanup, docs

- `frontend/Dockerfile`: `node:24-alpine`, `npm ci`, `npm run build`, `CMD node .output/server/index.mjs`, `ENV PORT=3000`.
- `compose.yaml`: `web` builds `./frontend` with `ILMJ_ROOT=/data`, mounts `./prompts.json` and `./cringe.json` read-only into `/data`, `OLLAMA_HOST=http://ollama:11434`, ports `8000:3000`; `ollama` drops `OLLAMA_ORIGINS`.
- `compose.demo.yaml`: tunnel `--url http://web:3000`. Delete `nginx.conf`.
- Delete `frontend/legacy/`.
- Docs: REQUIREMENTS §5/§8/§9/§10, AGENTS.md Overview/Commands, docs/README.md, PROGRESS.md.

Checks: `docker compose up -d --build` → `localhost:8000/` 200 and translate works; `localhost:8000/.git/config` 404; `python test_mcp_server.py` ALL PASS; `npm test` all pass.

- [ ] Steps: as above; commit `build: run TanStack app in Docker, drop legacy page and nginx`.
