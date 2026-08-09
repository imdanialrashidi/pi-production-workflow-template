#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v pi >/dev/null 2>&1; then
  cat >&2 <<'MSG'
Pi is not installed.

Install the official package:
  npm install -g --ignore-scripts @earendil-works/pi-coding-agent@0.84.1
MSG
  exit 127
fi

if [[ -f "$ROOT_DIR/.pi/models.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.pi/models.env"
fi

export PI_TELEMETRY="${PI_TELEMETRY:-0}"
export PI_SKIP_VERSION_CHECK="${PI_SKIP_VERSION_CHECK:-1}"
export PI_CACHE_RETENTION="${PI_CACHE_RETENTION:-long}"

args=(
  --tools
  "read,bash,edit,write,grep,find,ls,subagent,todo,mcp,lsp_diagnostics,lsp_hover,lsp_definition,lsp_references,lsp_document_symbols,lsp_workspace_symbols,lsp_more,doc_search_resolve_library_id,doc_search_get_library_docs,doc_search_get_cached_doc_raw,image_ask,web_search,web_fetch"
)

if [[ -n "${PI_MAIN_MODEL:-}" ]]; then
  args+=(--model "$PI_MAIN_MODEL")
fi

if [[ -n "${PI_MAIN_THINKING:-}" ]]; then
  args+=(--thinking "$PI_MAIN_THINKING")
fi

if [[ -n "${PI_ENABLED_MODELS:-}" ]]; then
  args+=(--models "$PI_ENABLED_MODELS")
fi

exec pi "${args[@]}" "$@"
