#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 -m json.tool "$repo_root/.claude-plugin/marketplace.json" >/dev/null
python3 -m json.tool "$repo_root/plugins/codex-reviewer/.claude-plugin/plugin.json" >/dev/null
bash -n "$repo_root/plugins/codex-reviewer/bin/run-codex-review"

if command -v claude >/dev/null 2>&1; then
  claude plugin validate "$repo_root"
else
  echo "claude CLI not found; skipped claude plugin validate" >&2
fi

