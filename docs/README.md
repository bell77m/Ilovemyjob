# Docs

Index of project documentation.

| Doc | What it covers |
|-----|----------------|
| [REQUIREMENTS.md](../REQUIREMENTS.md) | LinkedIn Translator spec: features, tech stack, RAG, MCP server, setup, demo checklist. |
| [DESIGN.md](../DESIGN.md) | Netscape 96 UI theme: colors, type, layout, components, starter CSS. All UI follows it. |
| [preview.html](../preview.html) | Live preview of the theme. Open in a browser. |
| [frontend/](../frontend/) | LinkedIn Translator app: TanStack Start (React, Router, Query, Form), Netscape 96 theme. `npm run dev` (:3000). Tests: `npm test`. |
| [mcp_server.py](../mcp_server.py) | MCP server for AI agents (stdio): `linkedinify`, `decrypt_recruiter`, `synergy_score`. Tests: `python test_mcp_server.py`. |
| [prompts.json](../prompts.json), [cringe.json](../cringe.json) | Shared config (models, prompts, buzzwords) and RAG corpus, read by page and MCP server. |
| [compose.yaml](../compose.yaml) | Docker setup: Ollama + models + the TanStack app. `docker compose up -d --build`. |
| [compose.demo.yaml](../compose.demo.yaml) | Hackathon demo: GPU + free public URL via Cloudflare tunnel. See file header. |
| [superpowers/specs/](superpowers/specs/) | Design specs: TanStack frontend rebuild. |
| [superpowers/plans/](superpowers/plans/) | Implementation plans: LinkedIn Translator (vanilla), TanStack frontend rebuild. |
| [PROGRESS.md](../PROGRESS.md) | What's done, what's next. |
| [AGENTS.md](../AGENTS.md) | Instructions for coding agents. |
| [.agents/rules/testing.md](../.agents/rules/testing.md) | Rules for writing tests. |
| [.agents/skills/](../.agents/skills/) | Reusable agent skills (e.g. commit messages). |
