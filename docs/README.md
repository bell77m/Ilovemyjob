# Docs

Index of project documentation.

| Doc | What it covers |
|-----|----------------|
| [REQUIREMENTS.md](../REQUIREMENTS.md) | LinkedIn Translator spec: features, tech stack, RAG, MCP server, setup, demo checklist. |
| [DESIGN.md](../DESIGN.md) | Netscape 96 UI theme: colors, type, layout, components, starter CSS. All UI follows it. |
| [preview.html](../preview.html) | Live preview of the theme. Open in a browser. |
| [frontend/index.html](../frontend/index.html) | LinkedIn Translator page (Netscape 96 theme). Serve repo root on :8000, open `/frontend/`. Tests: `frontend/tests.html`. |
| [mcp_server.py](../mcp_server.py) | MCP server for AI agents (stdio): `linkedinify`, `decrypt_recruiter`, `synergy_score`. Tests: `python test_mcp_server.py`. |
| [prompts.json](../prompts.json), [cringe.json](../cringe.json) | Shared config (models, prompts, buzzwords) and RAG corpus, read by page and MCP server. |
| [compose.yaml](../compose.yaml) | Docker setup: Ollama + models + nginx. `docker compose up -d`. |
| [compose.demo.yaml](../compose.demo.yaml) | Hackathon demo: GPU + free public URL via Cloudflare tunnel. See file header. |
| [superpowers/plans/](superpowers/plans/) | Implementation plans. Current: LinkedIn Translator, 10 tasks. |
| [PROGRESS.md](../PROGRESS.md) | What's done, what's next. |
| [AGENTS.md](../AGENTS.md) | Instructions for coding agents. |
| [.agents/rules/testing.md](../.agents/rules/testing.md) | Rules for writing tests. |
| [.agents/skills/](../.agents/skills/) | Reusable agent skills (e.g. commit messages). |
