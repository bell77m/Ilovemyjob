# Project Instructions

Shared instructions for every coding agent on this project (Claude Code loads it via `CLAUDE.md`). Keep it short and factual.

## Overview
LinkedIn Translator: `frontend/` is a TanStack Start app (React, Router, Query, Form). Its server functions (`src/server/`) call local Ollama, run RAG and stream LinkedIn posts to the page; pure logic is in `src/lib/cringe.ts`. `mcp_server.py` exposes the same tools over MCP stdio (Python twin of `cringe.ts`). `prompts.json` and `cringe.json` (repo root) are shared by both. Spec: `REQUIREMENTS.md`.

## Commands
- Run app: `docker compose up -d --build`, open http://localhost:8000. Or `ollama serve` + `cd frontend && npm install && npm run dev`, open http://localhost:3000
- JS tests: `cd frontend && npm test` (Vitest)
- Python tests: `python -m pip install "mcp>=2" && python test_mcp_server.py`
- MCP: `claude mcp add ilovemyjob -- python <abs path>/mcp_server.py`

## Conventions
<!-- Code style, naming, folder layout, things agents must always/never do. -->
- All UI follows `DESIGN.md` (Netscape 96 theme). Read it before building or styling UI.
- Writing or editing tests: follow `.agents/rules/testing.md`.
- Before ending any task that changed files, run the `update-progress` skill (`.agents/skills/update-progress/`). Claude Code enforces this with a Stop hook.

Reusable skills live in `.agents/skills/`.
