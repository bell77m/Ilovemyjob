# Progress

Update this file when work lands. Newest first.

## Done

- 2026-10-10 — `nginx.conf`: dotfiles return 404. Before, the public tunnel served `.git/`, `.claude/` and `.remember/` (whole repo is mounted). Checked locally and through the tunnel URL.
- 2026-10-10 — `cringe.json`: grown to 40 hand-written pairs (commuting, pets, kids, weather, office tech, career setbacks); live retrieval picks on-topic examples. `preview.html` location bar shows `http://localhost:8000/preview.html`.
- 2026-10-10 — Hackathon demo sharing: `compose.demo.yaml` (Ollama on NVIDIA GPU + Cloudflare quick tunnel), `nginx.conf` proxies only `/api/generate` and `/api/embed`, page uses same-origin Ollama when not on localhost. Checked through public tunnel: page, embed, generate (~2s warm on RTX 4050), `/api/pull` and `/api/tags` return 404.
- 2026-10-10 — Acceptance: MCP registered in Claude Code (local scope), headless `claude -p` lists `decrypt_recruiter`, `linkedinify`, `synergy_score` and `linkedinify` returns a post ending "Agree?". Browser with `nomic-embed-text` removed: post still streams, "Sources: vibes only"; after re-pull, next run shows 3 sources without reload.
- 2026-10-10 — Review minors fixed. MCP: timeout says "thinking too slowly" (not "unemployed"), cut-off/non-JSON replies become tool errors, HTTP errors show only Ollama's `error` text, blank `decrypt_recruiter` answer says "No comment." (Python 31/31). Page: failed run clears old sources/meter/engagement, spaces-only input shows the "fill out this field" hint, failed query embed keeps corpus vectors, last stream line without newline is parsed. Spec: lazy embedding, `pip install "mcp>=2"`, app URL `/frontend/`.
- 2026-10-10 — Review fixes: "Agree?" anywhere on the last line counts (no double "Agree?" after emoji/hashtags); preamble strip only drops a whole "Here is ...:" line (keeps "Here's what I learned: ..." openers); `#output` gets `aria-busy` while streaming. JS 27/27, Python 26/26.
- 2026-10-10 — `frontend/index.html` wired: streaming translate (F1/F2), Win95 error `<dialog>` (F5), "Agree?" rule (F12), copy button, loading messages, remembered cringe slider (F3/F4/F6), browser RAG + sources (F13), Decrypt Recruiter (F7), Synergy Meter + fake engagement (F8/F9). Checked live in Chrome: stream, sources, reverse, Ollama-down dialog, 375px no scroll, only localhost requests.
- 2026-10-10 — `frontend/lib.js`: `cosine`, `topK`, `synergyScore` (24 checks in `tests.js`).
- 2026-10-10 — `prompts.json` `system` says few-shot pairs are examples only (3B model was rewriting all 3); `enforceAgree`/`enforce_agree` strip echoed `Human:`/`LinkedIn:` labels and "Here is the post:" preambles.
- 2026-10-10 — `AGENTS.md`: Overview and Commands filled.
- 2026-10-10 — `mcp_server.py`: `linkedinify` and `decrypt_recruiter` MCP tools (Ollama via `urllib`, lazy corpus embeddings, top-3 RAG examples, falls back to no examples if embedding fails); errors reach the agent as `ToolError` text. 20 checks in `test_mcp_server.py`; live stdio smoke test passed (Ollama up, down, back up, server stays alive).
- 2026-10-10 — `prompts.json`: `reverseSystem` now says the few-shot pairs are examples only (3B model was translating them too).
- 2026-10-10 — `mcp_server.py`: MCP server (mcp 2.x `MCPServer`, stdio) with `synergy_score` tool and Python twins of `lib.js` helpers; `test_mcp_server.py` (11 checks, `python test_mcp_server.py`).
- 2026-10-10 — `cringe.json`: starter RAG corpus, 12 hand-written human → LinkedIn pairs (§4 rows first).
- 2026-10-10 — `prompts.json` (shared models + prompts + buzzwords), `frontend/lib.js` (`buildPrompt`, `enforceAgree`, `splitNdjson`), `frontend/tests.js` + `tests.html` (11 checks, Node or browser).
- 2026-10-10 — `frontend/index.html`: static LinkedIn Translator page skeleton in Netscape 96 theme (input, cringe slider, buttons, output, sources, Win95 error dialog, status bar). No functionality wired yet.
- 2026-10-10 — `frontend/index.html`: four floating ads (ghost as horror movie, lobster as networking lunch) bouncing like a screensaver, linear motion via JS, static under reduced motion.
- 2026-10-10 — `frontend/index.html`: ad close buttons hide their ad and stop it moving.
- 2026-10-10 — `frontend/index.html`: ads crawl at 30px/s, burst to 600px/s for 2.5s, then 12s cooldown before the next burst.
- 2026-10-10 — `frontend/index.html`: full-page haunted house image shown once for 1s, 5 minutes after page load.
- 2026-10-10 — `frontend/index.html`: status bar "Document: Done" appends "AI" every 2s: 20s, pause 3 min, spam 10 min, then random pause (4–8 min) and shorter random spam.
- 2026-10-10 — `frontend/index.html`: when every ad is closed, all ads reappear at random positions after 12s.
- 2026-10-10 — `docs/superpowers/plans/2026-10-10-linkedin-translator.md`: implementation plan, 10 TDD tasks (MVP page, corpus, RAG, MCP server, reverse mode, Synergy Meter, acceptance pass).
- 2026-10-10 — `compose.yaml`: Docker setup (Ollama 0.33.2 with CORS preset, one-shot model pull, nginx on :8000). Documented in `REQUIREMENTS.md` section 8.
- 2026-10-10 — `REQUIREMENTS.md`: added F13 RAG (`cringe.json` + `nomic-embed-text`, in-RAM cosine top-3) and F14 MCP server (`mcp_server.py`, FastMCP, stdio), shared `prompts.json`.
- 2026-10-10 — `REQUIREMENTS.md`: LinkedIn Translator spec (local LLM via Ollama, single HTML file, Netscape 96 UI), plus RAG (`cringe.json` few-shot retrieval) and MCP server (`mcp_server.py`) sections.
- 2026-10-10 — Auto progress loop: `update-progress` skill for all agents, plus a Claude Stop hook (`.claude/hooks/progress-reminder.sh`) that makes Claude keep working if files changed after PROGRESS.md.
- 2026-10-10 — `docs/README.md` index and this `PROGRESS.md`.
- 2026-10-10 — `preview.html`: Netscape 96 theme preview (background picker, width switcher, scrolling banner, guestbook). Checked at desktop, 640x480, phone and night mode.
- 2026-10-10 — `AGENTS.md`, `.agents/` rules and commit-message skill.
- 2026-10-10 — `DESIGN.md`: Netscape 96 design spec.
- 2026-10-10 — Repo renamed `stupid-geo` → `Ilovemyjob`.

## Next

- [ ] Tunnel URL changes on every restart; for a permanent link host on HF Spaces (Docker, CPU, slow).
