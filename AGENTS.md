# Project Instructions

Shared instructions for every coding agent on this project (Claude Code loads it via `CLAUDE.md`). Keep it short and factual.

## Overview
<!-- What this project is, in 1-2 lines. -->

## Commands
<!-- e.g. build: `npm run build` | test: `npm test` | lint: `npm run lint` -->

## Conventions
<!-- Code style, naming, folder layout, things agents must always/never do. -->
- All UI follows `DESIGN.md` (Netscape 96 theme). Read it before building or styling UI.
- Writing or editing tests: follow `.agents/rules/testing.md`.
- Before ending any task that changed files, run the `update-progress` skill (`.agents/skills/update-progress/`). Claude Code enforces this with a Stop hook.

Reusable skills live in `.agents/skills/`.
