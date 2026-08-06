#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ci_mode=0
[[ "${1:-}" == "--ci" ]] && ci_mode=1

failures=0

pass() { printf 'PASS  %s\n' "$1"; }
warn() { printf 'WARN  %s\n' "$1" >&2; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }

required=(
  AGENTS.md
  p
  .pi/settings.json
  .pi/models.env
  .pi/APPEND_SYSTEM.md
  .pi/extensions/safety-guard.js
  .pi/prompts/build.md
  .pi/prompts/plan.md
  .pi/prompts/review.md
  .pi/prompts/ship.md
  .pi/skills/risk-review/SKILL.md
  .pi/skills/verification-routing/SKILL.md
  .pi/skills/browser-qa/SKILL.md
)

for file in "${required[@]}"; do
  [[ -f "$file" ]] && pass "$file exists" || fail "$file is missing"
done

if node -e 'JSON.parse(require("fs").readFileSync(".pi/settings.json","utf8"))' >/dev/null 2>&1; then
  pass ".pi/settings.json is valid JSON"
else
  fail ".pi/settings.json is invalid JSON"
fi

if node --check .pi/extensions/safety-guard.js >/dev/null 2>&1; then
  pass "safety guard parses"
else
  fail "safety guard has a JavaScript syntax error"
fi

if bash -n p scripts/verify.sh; then
  pass "shell entrypoints parse"
else
  fail "shell syntax validation failed"
fi

if grep -Fq '"npm:pi-sub-agent@0.1.5"' .pi/settings.json; then
  pass "subagent package is pinned"
else
  fail "subagent package pin is missing"
fi

missing_frontmatter=0
while IFS= read -r -d '' file; do
  first_line="$(head -n 1 "$file" || true)"
  if [[ "$first_line" != "---" ]]; then
    printf 'Missing frontmatter: %s\n' "$file" >&2
    missing_frontmatter=1
  fi
done < <(find .pi/prompts .pi/skills -type f -name '*.md' -print0)

if [[ "$missing_frontmatter" -eq 0 ]]; then
  pass "prompt and skill frontmatter markers found"
else
  fail "one or more prompt/skill files have no YAML frontmatter"
fi

secret_scan_file="$(mktemp)"
trap 'rm -f "$secret_scan_file"' EXIT

if find . -maxdepth 4 -type f \
  \( -path './.pi/*' -o -name 'p' -o -path './docs/*' \) \
  -print0 |
  xargs -0 grep -En \
    'sk-[A-Za-z0-9_-]{16,}|(API_KEY|ACCESS_TOKEN|SECRET|PASSWORD)[[:space:]]*=[[:space:]]*[^"<${][^[:space:]]+' \
    >"$secret_scan_file" 2>/dev/null; then
  cat "$secret_scan_file" >&2
  fail "possible secret found"
else
  pass "no obvious committed secret pattern found"
fi

if [[ -e opencode.jsonc || -e .opencode || -e oc ]]; then
  fail "legacy OpenCode workflow files remain"
else
  pass "legacy OpenCode workflow removed"
fi

if command -v pi >/dev/null 2>&1; then
  version="$(pi --version 2>/dev/null | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || true)"
  if [[ -n "$version" ]]; then
    if [[ "$(printf '%s\n%s\n' "0.74.0" "$version" | sort -V | head -n1)" == "0.74.0" ]]; then
      pass "Pi $version satisfies minimum 0.74.0"
    else
      fail "Pi $version is older than required 0.74.0"
    fi
  else
    warn "Pi is installed but its version could not be parsed"
  fi
elif [[ "$ci_mode" -eq 1 ]]; then
  warn "Pi CLI is not installed in CI; static workflow validation only"
else
  fail "Pi CLI is not installed"
fi

if [[ "$failures" -gt 0 ]]; then
  printf '\n%d validation failure(s)\n' "$failures" >&2
  exit 1
fi

printf '\nPi workflow validation passed.\n'
