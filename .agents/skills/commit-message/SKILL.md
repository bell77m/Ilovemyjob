---
name: commit-message
description: Writes a conventional commit message from the staged diff. Use when the user asks for a commit message or to commit.
---

1. Run `git diff --staged`.
2. Write a message in Conventional Commits form: `type(scope): summary` (feat, fix, refactor, docs, test, chore).
3. Summary under 72 chars, imperative mood. Add a body only when the "why" isn't obvious.
