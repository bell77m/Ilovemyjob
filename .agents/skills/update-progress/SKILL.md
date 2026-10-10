---
name: update-progress
description: Updates PROGRESS.md and docs after work lands. Use at the end of any task that changed project files.
---

1. Run `git status --short` and `git diff` to see what changed.
2. `PROGRESS.md`: add one line per finished piece of work at the top of **Done** (`- YYYY-MM-DD — what, where`). Tick or remove items in **Next** that are done; add new follow-ups you found.
3. `docs/README.md`: add a row for any new doc or top-level file worth finding; drop rows for deleted ones.
4. Keep entries one line, factual. No entry for typo fixes or edits to PROGRESS.md itself.
