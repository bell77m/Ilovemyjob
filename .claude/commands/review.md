---
description: Review a file or the current changes for bugs
argument-hint: [path]
allowed-tools: Read, Grep, Glob, Bash(git diff:*)
---

Review $ARGUMENTS (or the current uncommitted changes if no path is given).

Report only real problems: bugs, security issues, missing error handling.
One line per finding: `path:line — problem — fix`.
