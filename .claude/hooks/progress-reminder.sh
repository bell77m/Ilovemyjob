#!/usr/bin/env bash
# Stop hook: if any changed file is newer than PROGRESS.md, send Claude back once
# to update it. Exit 2 = keep going; stderr is shown to Claude.
input=$(cat)
# Already sent back once this turn: let Claude stop (prevents an endless loop).
grep -Eq '"stop_hook_active" *: *true' <<<"$input" && exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
[ -f PROGRESS.md ] || exit 0

while read -r path; do
  case "$path" in PROGRESS.md|.remember/*|.codegraph/*) continue ;; esac
  if [ -e "$path" ] && [ "$path" -nt PROGRESS.md ]; then
    echo "Files changed since PROGRESS.md was last updated (e.g. $path). Follow .agents/skills/update-progress/SKILL.md, or stop if the change is too small to log." >&2
    exit 2
  fi
done < <(git status --porcelain -uall 2>/dev/null | sed -E 's/^.. //; s/.* -> //')
exit 0
