# Ilovemyjob — LinkedIn Translator

> "I got fired" → "Thrilled to announce I'm embarking on an exciting new chapter of my journey. 🚀 Agree?"

Stupid Hackathon entry. User types a normal human sentence. A local LLM rewrites it as a LinkedIn post: humblebrag, fake lessons, emoji, hashtags, "Agree?". Runs fully offline, because your boss must never know.

Now with **RAG** (Retrieval-Augmented Grandstanding) and **MCP** (Most Cringe Protocol), so the pitch deck scores full buzzword bingo.

## 1. Goal

- Turn any plain sentence into peak LinkedIn speak.
- Run on a laptop with a local LLM. No API key, no cloud, no cost.
- Look like a 1996 homepage (see `DESIGN.md`, Netscape 96). A modern social network rendered in the ugliest era of the web is the joke.
- Demo works in under 5 minutes of setup on hackathon Wi-Fi (meaning: no Wi-Fi).

## 2. Users

| User | Wants |
|------|-------|
| Hackathon judge | Laugh within 10 seconds. |
| Office worker | Post about eating a sandwich as if it were a Series A. |
| Recruiter | Already speaks this. Uses Reverse mode to learn human. |

## 3. Features

### Must have (MVP, build first)

- **F1 Translate.** Text box ("What actually happened?") + button `Make It Professional™`. Output box shows LinkedIn post.
- **F2 Streaming output.** Tokens appear one by one, like a 28.8k modem. Button disabled while generating.
- **F3 Copy button.** `Copy to Clipboard` so user can post it for real and lose friends.
- **F4 Loading messages.** Rotate while waiting: "Humbled to be generating...", "Leveraging synergies...", "Circling back...", "Disrupting your request...".
- **F5 Error box.** If Ollama is not running, show a Win95 error dialog: "This program has performed an illegal operation: your LLM is unemployed. Run `ollama serve`." Never fail silently.

### Must have, part 2 (buzzword compliance)

The pitch needs the words "RAG" and "MCP". Build after the MVP works.

- **F13 RAG, Retrieval-Augmented Grandstanding.** Before each translation, find the 3 most similar examples in a hand-written cringe corpus and put them in the prompt as few-shot examples. Show them under the output as **"Sources: 3 thought leaders"**, like citations. See §6.
- **F14 MCP, Most Cringe Protocol.** Small MCP server so any AI agent (Claude Code, Claude Desktop, Cursor) can call the translator as a tool. Your coding agent can now write commit messages as LinkedIn posts. See §7.

### Should have (if time)

- **F6 Cringe level slider** 1–10. Sent to the prompt. 1 = "mildly corporate". 10 = "my toddler's first steps taught me about B2B sales".
- **F7 Reverse mode** (`Decrypt Recruiter`). LinkedIn post → what it really means. Same model, different system prompt.
- **F8 Synergy Meter.** Count buzzwords in output (synergy, leverage, journey, humbled, grateful, disrupt, passionate, thought leader, 🚀). Show as Win95 progress bar. Pure JS, word list in an array.
- **F9 Fake engagement.** Under the post: random "1,337 reactions · 420 comments · 69 reposts". Visitor counter style per `DESIGN.md`.

### Could have (only if everything else works)

- **F10 Buzzword Bingo** 5×5 card that auto-marks squares as the post streams in.
- **F11 Modem sound** on submit (one `.wav`, `<audio>` tag).
- **F12 "Agree?" enforcer.** If model forgot to end with "Agree?", append it. Always.

### Won't have

Accounts, database, posting to real LinkedIn, mobile app, fine-tuning, history, analytics. Skipped on purpose.

## 4. Example translations (use as test cases and few-shot examples)

| Human | LinkedIn |
|-------|----------|
| I got fired. | Thrilled to announce I'm open to new opportunities after an incredible journey. Grateful for every lesson. 🚀 #OpenToWork #Growth |
| I ate a sandwich. | Today I paused for lunch and realized: a sandwich is just layers working in synergy. Just like great teams. 🥪 Agree? |
| I overslept. | I chose rest over hustle culture this morning. Burnout is not a KPI. ☀️ #Wellness #Leadership |
| My code doesn't work. | Failure is just success in beta. 7 lessons today's production outage taught me about resilience. 🧵👇 |

## 5. Tech stack (deliberately stupid)

Rule: maximum dumb, still demo-proof. Every stupid choice must still work on stage.

| Layer | Choice | Why it is stupid | Why it still works |
|-------|--------|------------------|--------------------|
| Frontend | **One `index.html`**, inline CSS + vanilla JS | No React, no build, no `node_modules`. Like 1996. | Opens anywhere. Nothing to break. |
| Layout | `<table>` layout, `<marquee>`, `<blink>`-style CSS | Banned since 2004. | Browsers still render it. Matches `DESIGN.md`. |
| Styling | `DESIGN.md` Netscape 96 tokens, copied from `preview.html` | A 2026 AI app styled like Windows 95. | Starter CSS already exists. |
| LLM runtime | **Ollama** on `localhost:11434` | Your laptop fan is the backend. | One install, one command, offline. |
| Model | `llama3.2:3b` (default). `qwen2.5:0.5b` for potato laptops. | A billion parameters to write "Agree?". | Small, fast on CPU, good enough at cringe. |
| Backend | **None.** Browser calls Ollama HTTP API directly with `fetch`. | Zero-tier architecture. | Fewer moving parts, nothing to deploy. |
| Server | `python -m http.server 8000` | Python used only to serve one file. | Already installed on most laptops. |
| Database | **None.** Cringe level saved in `localStorage`. | Your browser is the DB. | Only per-user setting needed. |
| RAG corpus | `cringe.json`, ~40 hand-written human → LinkedIn pairs | "Knowledge base" is one JSON file the team wrote at 3 a.m. | Small enough to embed on every page load. |
| Embeddings | Ollama `nomic-embed-text` | A second neural network just to find similar humblebrags. | Same Ollama, one more `pull`, offline. |
| Vector DB | **A JavaScript array in RAM.** Cosine similarity in a 5-line `for` loop. | Vector database: Ctrl+F with math. | 40 vectors × 768 dims searches in under 1 ms. |
| MCP server | `mcp_server.py`, one file, official `mcp` Python SDK 2.x (`MCPServer`, was `FastMCP` in 1.x), stdio | Python returns, now as a "microservice". | About 60 lines. No ports, no auth needed. |
| Shared config | `prompts.json`: system prompts + model names, read by `index.html` and `mcp_server.py` | Two apps share a config file like it's 1996. | One place to tune cringe; web and MCP give the same output. |
| Deploy | Run from laptop at the table. Optional: `index.html` on a USB stick labeled "FLOPPY". | No cloud. | Cannot go down because of venue Wi-Fi. |
| Tests | One `tests.html` with `console.assert` for Synergy Meter, "Agree?" enforcer and cosine top-k. One `test_mcp_server.py` with plain `assert` for the Python top-k. | No test framework. | Follows `.agents/rules/testing.md` spirit: smallest check that fails if logic breaks. |

### LLM call

`POST http://localhost:11434/api/generate`

```json
{
  "model": "llama3.2:3b",
  "system": "<system prompt below>",
  "prompt": "Cringe level: 7/10\nHuman text: I ate a sandwich.",
  "stream": true,
  "options": { "temperature": 0.9 }
}
```

Response is newline-delimited JSON. Read with `response.body.getReader()`, append each `.response` chunk to output, stop on `"done": true`.

### System prompt (v1)

```
You are a LinkedIn thought leader. Rewrite the user's text as a LinkedIn post.
Rules:
- Turn every bad event into a growth opportunity or lesson.
- Humblebrag. Be "humbled", "thrilled", "grateful".
- Use buzzwords: synergy, leverage, journey, disrupt, passionate.
- Short one-sentence paragraphs.
- Add 2-5 emoji and 2-4 hashtags.
- End with "Agree?"
- Scale absurdity to the cringe level (1 = mild, 10 = unhinged).
- Output only the post. No preamble.
```

Reverse mode prompt (`reverseSystem` in `prompts.json`): "Translate the final 'LinkedIn post' into the blunt, honest sentence the author actually means. The LinkedIn/Human pairs before it are examples only: never repeat or translate them. Reply with one or two sentences, no emoji, no preamble." (The 3B model otherwise translated the few-shot examples too.)

Both prompts live in `prompts.json` so the web page and the MCP server use the same text.

## 6. RAG: Retrieval-Augmented Grandstanding

Goal: the model copies real cringe patterns instead of inventing weak ones. A tiny model with 3 good examples beats a tiny model with none.

### Corpus: `cringe.json`

```json
[
  { "human": "I got fired.", "linkedin": "Thrilled to announce I'm open to new opportunities... 🚀 #OpenToWork" },
  { "human": "I ate a sandwich.", "linkedin": "Today a sandwich taught me about synergy... Agree?" }
]
```

- 30–50 pairs. The team writes them during the hackathon (this is the fun part). Cover: job loss, food, commuting, kids, pets, bugs, weather, gym, coffee, sleeping in.
- Write or paraphrase posts yourselves. Don't scrape LinkedIn: it breaks their terms, and real posts contain real people's names.
- The four rows in §4 go in first.

### Flow (runs in the browser, no backend)

1. **On page load:** send all `human` texts in one call to `POST /api/embed` (`{"model": "nomic-embed-text", "input": [...]}`). Keep the returned `embeddings` array in memory. Status bar shows "Indexing thought leadership... 40/40".
2. **On translate:** embed the user's text, compute cosine similarity against every stored vector, take the top 3.
3. **Prompt:** put those 3 pairs before the user's text as examples (`Human: ... / LinkedIn: ...`).
4. **Show sources:** list the 3 retrieved `linkedin` posts under the output as "Sources: 3 thought leaders", each with a fake name ("Chad Synergy, Chief Vibes Officer").
5. **Reverse mode:** same, but embed and match on the `linkedin` side and use the `human` side as answers. Build a second vector array on first use.

Notes:
- `nomic-embed-text` expects prefixes: `search_document: ` on corpus texts, `search_query: ` on the user's text. Retrieval is noticeably worse without them.
- Vectors are rebuilt on every page load. Ceiling: fine up to a few hundred pairs. Past that, cache vectors in a precomputed `cringe.vectors.json`.
- If embedding fails (model not pulled), translate without examples and show "Sources: vibes only" in the status bar. Translation must still work.

## 7. MCP: Most Cringe Protocol

Goal: AI agents get LinkedIn powers. Demo: Claude Code turns its own commit message into a LinkedIn post.

### Server: `mcp_server.py`

- Official Python SDK: `pip install mcp` (2.x), `from mcp.server.mcpserver import MCPServer` (1.x called it `FastMCP`).
- Transport: **stdio only**. No HTTP port, nothing exposed on the network.
- Talks to the same Ollama (`localhost:11434`) with `urllib.request` from the standard library. No `requests`, no `httpx`.
- Reads `prompts.json` and `cringe.json`. Does the same RAG as the browser: embeds the corpus on the first tool call (so the server starts even while Ollama is down) and keeps the vectors in a list.

### Tools

| Tool | Input | Output |
|------|-------|--------|
| `linkedinify` | `text: str` (max 500 chars), `cringe: int = 7` (1–10) | LinkedIn post (string). Ends with "Agree?" (F12 rule also applies here). |
| `decrypt_recruiter` | `post: str` (max 3000 chars) | What the post really means, in one or two honest sentences. |
| `synergy_score` | `text: str` | `{ "score": 0-100, "buzzwords": ["synergy", "journey"] }`. Pure Python, no LLM. Same word list as F8. |

Rules:
- Validate inputs at the tool boundary: reject empty text, cut text over the limit, clamp `cringe` to 1–10.
- If Ollama is down, return a tool error with the text "Ollama is unemployed. Run `ollama serve`." Do not crash the server.
- Tools have no side effects. They never post anywhere, write files or call the internet.

### Hook it up

```powershell
# Claude Code
claude mcp add ilovemyjob -- python C:\path\to\Ilovemyjob\mcp_server.py
```

Claude Desktop / Cursor: add the same command under `mcpServers` in their config JSON.

Smoke test: ask the agent "Use linkedinify on: I fixed a typo." Expect a post about growth and attention to detail.

## 8. Setup (target: under 5 minutes)

```powershell
# 1. Install Ollama from https://ollama.com, then:
ollama pull llama3.2:3b
ollama pull nomic-embed-text
# 2. Allow the page to call Ollama (CORS), then start it:
$env:OLLAMA_ORIGINS = "http://localhost:8000"
ollama serve
# 3. In the project folder:
python -m http.server 8000
# 4. Open http://localhost:8000/frontend/
# 5. Optional, for MCP:
pip install "mcp>=2"
claude mcp add ilovemyjob -- python mcp_server.py
```

Opening `index.html` via `file://` fails CORS unless `OLLAMA_ORIGINS=*`. Use the Python server.

**Or with Docker** (replaces steps 1–3): `docker compose up -d`, wait for the `pull` container to exit, open http://localhost:8000/frontend/. `compose.yaml` runs Ollama (CORS preset), pulls both models into a volume once, and serves the folder with nginx. Stop host Ollama first (port 11434). Docker Ollama is CPU-only on Windows/macOS, so for the live demo prefer native Ollama if the laptop has a GPU.

## 9. Non-functional requirements

- **Offline.** Zero external requests at runtime. No CDN, fonts are system fonts per `DESIGN.md`.
- **Speed.** First token under 3 s on a normal laptop with `llama3.2:3b`. Full post under 20 s.
- **Input limit.** Max 500 characters, enforced by `maxlength`. Stops someone pasting a novel during demo.
- **Safety.** Output and retrieved sources are inserted with `textContent`, never `innerHTML`. Model output is untrusted.
- **MCP safety.** stdio only, no network listener, no file writes, inputs validated and length-capped.
- **RAG speed.** Corpus indexing under 5 s on page load. Retrieval adds under 500 ms per translation.
- **Accessibility.** Labels on inputs, buttons reachable by keyboard, output in an `aria-live="polite"` region. Ugly is fine; unusable is not.
- **Screen.** Looks right at 800×600 (the joke) and does not break on a phone (the judges).

## 10. Acceptance criteria (demo checklist)

- [ ] Type "I got fired", click button, LinkedIn post streams in with emoji, hashtags, ending "Agree?".
- [ ] Kill Ollama, click button: Win95 error dialog appears, page does not freeze.
- [ ] Copy button puts the post on clipboard.
- [ ] Works with Wi-Fi turned off.
- [ ] Page looks like `preview.html` theme.
- [ ] RAG: "I got fired" shows 3 sources, and the job-loss pair from `cringe.json` is one of them.
- [ ] RAG: with `nomic-embed-text` missing, translation still works and status shows "Sources: vibes only".
- [ ] MCP: Claude Code lists `linkedinify`, `decrypt_recruiter`, `synergy_score` and gets a post back from `linkedinify`.
- [ ] MCP: with Ollama stopped, the tool returns the "unemployed" error and the server keeps running.
- [ ] (Should) Slider at 1 vs 10 gives visibly different cringe.
- [ ] (Should) Reverse mode turns a real LinkedIn post into one honest sentence.

## 11. Build order

Two people can split after step 2: one on RAG + web features, one on MCP.

1. `index.html` skeleton with theme CSS from `preview.html`. `prompts.json` with the v1 prompts.
2. F1 + F2 + F5: fetch to Ollama with streaming and error dialog. **Demo-able from here.**
3. F3, F4.
4. F13 RAG: write `cringe.json` (start with 10 pairs, grow later), embed on load, top-3, sources panel.
5. F14 MCP: `mcp_server.py` with `linkedinify` first, then `synergy_score`, then `decrypt_recruiter`.
6. F6, F7, F8, F9.
7. Could-haves, only if bored.

## 12. Demo script (90 seconds)

1. "LinkedIn is a language. We built Google Translate for it. Runs offline so HR can't see."
2. Ask a judge for their worst week. Type it in.
3. Cringe slider to 10. Stream it. Read it out loud in a keynote voice.
4. Point at "Sources: 3 thought leaders". "It's RAG. Every humblebrag is grounded in peer-reviewed cringe."
5. Switch to Claude Code: "Commit my changes, and use linkedinify on the commit message." "It's MCP. Your AI agent now has a personal brand."
6. Reverse mode on a real LinkedIn post from a judge's feed.
7. End with: "Agree?"
