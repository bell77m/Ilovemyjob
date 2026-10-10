# TanStack Frontend Rebuild — Design

Date: 2026-10-10. Status: approved in chat, awaiting spec review.

## Why

The team knows React. One 500-line `index.html` with inline JS is hard for them to extend. Rebuild the page as a React app on TanStack Start (with Router, Query, Form) so teammates can add features in components and TypeScript.

## Decisions (from the user)

- Stack: TanStack **Start** (full-stack), **Router**, **Query**, **Form**, React.
- Goal: maintainability for a React team. Not a pitch gimmick, not a learning project.
- Migration: **replace** `frontend/` with **full parity**, jokes included. Old page deleted once parity is checked.

## Assumptions (correct me)

- `mcp_server.py`, `prompts.json`, `cringe.json` stay where they are and keep working unchanged.
- The demo still runs offline on the laptop. `npm install` and `npm run build` happen once beforehand, with internet.
- `DESIGN.md` (Netscape 96) still governs every pixel.

## What changes in the spec (REQUIREMENTS.md)

| Before | After |
|---|---|
| Frontend: one `index.html`, vanilla JS, no build | `frontend/`: TanStack Start app, React 19, TypeScript, Vite build |
| Backend: none, browser calls Ollama | Start server functions call Ollama and run RAG; browser calls only the app |
| Server: `python -m http.server` | Node runs the built Start server |
| Ollama CORS (`OLLAMA_ORIGINS`) required | Not needed: Ollama is called server-side |
| Tests: `tests.html` + `tests.js` | Vitest (`npm test`) |

Unchanged: Ollama + models, `prompts.json`, `cringe.json`, MCP server, all features F1–F14, all non-functional rules except "no backend" and "no build".

## Architecture

```
browser (React, Router, Query, Form)
   │  server function calls (same origin)
   ▼
Start server (Node) ── reads ../prompts.json, ../cringe.json
   │  fetch, server-side
   ▼
Ollama :11434  (/api/embed, /api/generate stream)
```

### Files

All under `frontend/`. Versions pinned exactly in `package.json` (at design time: `@tanstack/react-start` 1.168, `@tanstack/react-router` 1.170, `@tanstack/react-query` 5.104, `@tanstack/react-form` 1.33, `react` 19.3, `vite` 8.3, `vitest` 5.0).

| Path | Job |
|---|---|
| `src/routes/__root.tsx` | Netscape 96 shell: window title bar, header WordArt, footer badges, status bar, ads, jump scare. Provides `QueryClient`. |
| `src/routes/index.tsx` | Translate page: form, output, copy, engagement, Synergy Meter, sources. |
| `src/routes/decrypt.tsx` | Decrypt Recruiter page: same layout, reverse mode. |
| `src/server/ollama.ts` | Server functions `indexCorpus()` and `translate({text, cringe, reverse})`; Ollama fetch; error mapping; in-memory corpus vectors. |
| `src/lib/cringe.ts` | Pure logic ported from `lib.js`: `buildPrompt`, `enforceAgree`, `splitNdjson`, `cosine`, `topK`, `synergyScore`. Shared by server and client. |
| `src/components/` | `Ads`, `JumpScare`, `StatusBar` (with AI spam), `ErrorDialog`, `SynergyMeter`, `Sources`, `TranslateForm`, `PostOutput`. |
| `src/styles.css` | Current inline CSS from `index.html`, moved verbatim. |
| `public/images/` | `ghost.jpg`, `lobster.jpg`, `haunted-house.jpg` (moved from `frontend/images/`). |
| `src/**/*.test.ts` | Vitest tests. |

Deleted after parity: `frontend/index.html`, `frontend/lib.js`, `frontend/tests.js`, `frontend/tests.html`.

### Routes

- `/` — translate (forward mode).
- `/decrypt` — Decrypt Recruiter (reverse mode). Both pages share the shell; nav buttons styled per `DESIGN.md` switch between them.

### Data flow

1. **Index on load.** `__root` runs `useQuery({queryKey: ['corpus-index'], queryFn: indexCorpus})`. Server embeds `human` side of `cringe.json` (with `search_document: ` prefix) once, keeps vectors in module memory, returns `{count}`. Status bar: `Indexing thought leadership... 0/40` while pending, `40/40` on success, `Sources: vibes only` on error. Query retry: 1. A failed index is not cached server-side, so the next translate retries.
2. **Translate.** `TranslateForm` (TanStack Form: `text` required, trimmed, max 500; `cringe` 1–10, saved to `localStorage`) submits to `useMutation`. Mutation calls server function `translate({text, cringe, reverse})`.
3. **Server.** Validates input again (trust boundary: trim, cut to 500, clamp cringe). Retrieves top-3 examples (side `human` for forward, `linkedin` for reverse; `search_query: ` prefix). Empty list if embedding fails. Calls `POST /api/generate` with `stream: true`.
4. **Stream to client.** Server function returns a `ReadableStream` of NDJSON events:
   - `{"type":"sources","examples":[...]}` first,
   - `{"type":"token","text":"..."}` per Ollama chunk,
   - `{"type":"done"}` or `{"type":"error","message":"..."}`.
5. **Client.** Shows rotating loading messages until the first token, appends tokens, then on done: forward output gets `enforceAgree`, reverse gets `trim`. Shows sources ("Sources: 3 thought leaders" / "vibes only"), Synergy Meter, fake engagement (forward only). Copy enabled.

Streaming risk: plan task 1 is a spike proving a Start server function can return a stream the client reads incrementally. If not, fallback: a Start server route `POST /api/translate` returning the same NDJSON `Response`.

### Error handling

| Case | Server | Client |
|---|---|---|
| Ollama down | event `error`: `This program has performed an illegal operation: your LLM is unemployed. Run \`ollama serve\`.` | Win95 `ErrorDialog` |
| Ollama slow (>120 s) | event `error`: "thinking too slowly" text | dialog |
| Model not pulled / Ollama error | event `error`: `Ollama said: <error field>` | dialog |
| Embed model missing | translate with no examples | "Sources: vibes only" |
| Start server down / network | — | fetch fails → dialog "The server is unemployed. Run `npm run dev`." |
| Bad input | rejects empty, cuts, clamps | Form shows field error, nothing sent |

Every error re-enables buttons and stops the loading ticker. Model output and sources rendered as React text (never `dangerouslySetInnerHTML`).

### Jokes (full parity)

Ported as components with the same behavior and timings as today:
- `Ads`: 4 ads, screensaver bounce, 30 px/s crawl, 600 px/s burst for 2.5 s, 12 s cooldown, static under `prefers-reduced-motion`, close buttons, all reappear 12 s after the last is closed.
- `StatusBar`: appends "AI" every 2 s: 20 s, pause 3 min, spam 10 min, then random pause 4–8 min and shorter random spam.
- `JumpScare`: haunted house full-page for 1 s, once, 5 minutes after load.
- Visitor counter, badges, rainbow `hr`, WordArt.

## Run and deploy

- Dev: `cd frontend && npm install && npm run dev`; Ollama on `localhost:11434` (env `OLLAMA_HOST` overrides).
- `compose.yaml`: `web` becomes a Node image that builds and runs the Start server (container port 3000, host port 8000), with `OLLAMA_HOST=http://ollama:11434`. `ollama` drops `OLLAMA_ORIGINS`. `pull` unchanged. The repo is no longer mounted into a web root, so dotfiles cannot be served.
- `compose.demo.yaml`: tunnel points at `http://web:3000`. `nginx.conf` is deleted: Ollama is never exposed, only the app.
- MCP: unchanged.

## Testing

- Vitest:
  - `src/lib/cringe.test.ts`: the 27 checks from `tests.js`, one behavior per test.
  - `src/server/ollama.test.ts`: server logic with a fake `fetch`: Ollama down → unemployed event; HTTP error → `Ollama said:`; embed failure → no examples, still streams; input clamped/cut/rejected; event order sources → tokens → done.
- Live checks (chrome-devtools), same as the vanilla acceptance: stream token by token, 3 sources for "I got fired.", decrypt gives one honest sentence, Ollama-down dialog and buttons recover, 375 px no horizontal scroll, 800×600 looks like `preview.html`, only `localhost` requests from the browser, ads/AI spam/jump scare behave.
- Python `test_mcp_server.py` keeps passing (shared JSON untouched).

## Docs to update

`REQUIREMENTS.md` §5 stack table, §8 setup, §9 offline note, §10 checklist wording; `AGENTS.md` Overview + Commands; `docs/README.md`; `PROGRESS.md`.

## Out of scope

New features, history, accounts, SSR-specific SEO, TanStack Table/Virtual, changing the MCP server, changing prompts.

## Risks

- Demo now needs Node and a build. Mitigation: `npm run build` before the event; compose runs the built server.
- Start moves fast. Mitigation: exact version pins; spike first.
- Larger codebase for a joke app. Accepted: team maintainability is the goal.
