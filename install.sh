#!/usr/bin/env bash
set -euo pipefail

MARKETPLACE_SOURCE="${CODEX_REVIEW_MARKETPLACE_SOURCE:-jhubbardsf/claude-plugins}"
MARKETPLACE_NAME="${CODEX_REVIEW_MARKETPLACE_NAME:-joshd3v}"
PLUGIN_SPEC="${CODEX_REVIEW_PLUGIN_SPEC:-codex-reviewer@$MARKETPLACE_NAME}"
SCOPE="${CODEX_REVIEW_INSTALL_SCOPE:-user}"

usage() {
  cat <<'USAGE'
Usage:
  install.sh [--scope user|project|local]

Environment overrides:
  CODEX_REVIEW_MARKETPLACE_SOURCE  Marketplace source. Default: jhubbardsf/claude-plugins
  CODEX_REVIEW_MARKETPLACE_NAME    Marketplace name. Default: joshd3v
  CODEX_REVIEW_PLUGIN_SPEC         Plugin spec. Default: codex-reviewer@joshd3v
  CODEX_REVIEW_INSTALL_SCOPE       Install scope. Default: user
USAGE
}

while (($#)); do
  case "$1" in
    --scope)
      (($# >= 2)) || {
        echo "error: --scope requires user, project, or local" >&2
        exit 2
      }
      SCOPE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

case "$SCOPE" in
  user|project|local) ;;
  *)
    echo "error: invalid scope: $SCOPE" >&2
    exit 2
    ;;
esac

if ! command -v claude >/dev/null 2>&1; then
  echo "error: Claude Code CLI not found. Install Claude Code first." >&2
  exit 127
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "warning: codex CLI not found. Install and authenticate Codex before running the reviewer." >&2
fi

echo "Adding Claude plugin marketplace: $MARKETPLACE_SOURCE"
claude plugin marketplace add "$MARKETPLACE_SOURCE" --scope "$SCOPE"

echo "Installing plugin: $PLUGIN_SPEC"
claude plugin install "$PLUGIN_SPEC" --scope "$SCOPE"

cat <<EOF

Installed.

Open Claude Code, run /reload-plugins, then use:
  /codex-reviewer:codex-reviewer

EOF
