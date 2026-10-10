# Project Instructions

Shared instructions for every coding agent on this project (Claude Code loads it via `CLAUDE.md`). Keep it short and factual.

## Overview
LinkedIn Translator: `frontend/index.html` (vanilla JS, no build) calls local Ollama to rewrite sentences as LinkedIn posts. `frontend/lib.js` holds pure logic; `mcp_server.py` exposes the same tools over MCP stdio. `prompts.json` and `cringe.json` (repo root) are shared by both. Spec: `REQUIREMENTS.md`.

## Commands
- Run app: `docker compose up -d`, or `ollama serve` + `python -m http.server 8000` from the repo root; open http://localhost:8000/frontend/
- JS tests: `cd frontend && node -e "const r=f=>require('fs').readFileSync(f,'utf8');eval(r('lib.js')+';'+r('tests.js'))"` (or open `/frontend/tests.html`)
- Python tests: `python -m pip install "mcp>=2" && python test_mcp_server.py`
- MCP: `claude mcp add ilovemyjob -- python <abs path>/mcp_server.py`

## Conventions
<!-- Code style, naming, folder layout, things agents must always/never do. -->
- All UI follows `DESIGN.md` (Netscape 96 theme). Read it before building or styling UI.
- Writing or editing tests: follow `.agents/rules/testing.md`.
- Before ending any task that changed files, run the `update-progress` skill (`.agents/skills/update-progress/`). Claude Code enforces this with a Stop hook.

Reusable skills live in `.agents/skills/`.
