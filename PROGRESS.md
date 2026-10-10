# Progress

Update this file when work lands. Newest first.

## Done

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

- [ ] Register the MCP server in Claude Code: `claude mcp add ilovemyjob -- python "<repo>\mcp_server.py"`, then try `/mcp` and "Use linkedinify on: I fixed a typo."
- [ ] `llama3.2:3b` sometimes prefixes `linkedinify` output with "LinkedIn:" (copies the few-shot format); strip it in `enforce_agree`/`enforceAgree` if it shows up in the demo.
- [ ] Execute the plan in `docs/superpowers/plans/2026-10-10-linkedin-translator.md`, task by task.
- [ ] Fill `AGENTS.md` Overview and Commands once the app has a stack.
- [ ] Build `index.html` LinkedIn Translator MVP (F1–F5 in `REQUIREMENTS.md`).
- [ ] Browser RAG (F13, plan Task 5).
- [ ] Team grows cringe.json to 30–50 pairs (commuting, kids, pets, weather, gym, coffee...).
- [ ] Replace sample address `http://www.homepages.example/~stupid/` in `preview.html`.
