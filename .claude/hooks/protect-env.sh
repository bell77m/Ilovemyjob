#!/usr/bin/env bash
# PreToolUse hook (Edit|Write): block changes to .env files.
# Tool input arrives as JSON on stdin. Exit 2 = block; stderr is shown to Claude.
input=$(cat)
if grep -Eq '"file_path" *: *"[^"]*\.env(\.[^"/\\]*)?"' <<<"$input"; then
  echo "Blocked: editing .env files is not allowed. Ask the user to change it." >&2
  exit 2
fi
exit 0
