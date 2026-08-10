# Production Tooling Setup

This repository pins a small production-oriented Pi tool stack. Pi installs the project packages after the repository is trusted.

The reviewed Pi pin requires Node.js 22.19.0 or newer. The included CI pins Node 22.23.2; the container pins Node 24.19.0 on Debian Bookworm slim.

## Included packages

- `pi-sub-agent@0.1.5`
- `pi-mcp-adapter@2.20.1`
- `@juicesharp/rpiv-todo@2.1.0`
- `pi-lsp-adapter@0.1.3`
- `@dreki-gg/pi-doc-search@0.3.2`
- `pi-vision-tool@1.3.7`
- `@bytetrue/pi-web-search@0.1.3`

The project MCP configuration pins `@playwright/mcp@0.0.79` and exposes a restricted browser tool set through the single `mcp` proxy.

## First startup

```bash
./p
```

The repository launcher passes Pi's official `--approve` trust override, so it loads project resources and installs missing pinned packages without a trust prompt. Use `PI_PROJECT_TRUST=ask ./p` only when you intentionally want the interactive trust decision.

Reload after package changes:

```text
/reload
```

Validate the repository configuration:

```bash
bash scripts/pi-doctor.sh
```

## Todo panel

Confirm the extension:

```text
/todos
```

Use todos only for genuinely multi-step work.

## MCP and Playwright browser tools

Check the adapter:

```text
/mcp status
```

The Playwright server is lazy. It starts only on the first browser-tool call and stops after an idle period.

A useful smoke request is:

```text
Use the mcp proxy to find the Playwright page snapshot tool. Do not navigate anywhere.
```

For actual browser QA, start the project's local application and navigate to its URL. Begin with accessibility snapshots; use screenshots when appearance materially matters. Screenshots are stored under `.artifacts/playwright/`.

Autonomous mode exposes focused `browser_evaluate` when snapshots and normal interactions cannot reveal the required state. File upload, drag-and-drop file injection, and MCP scripting remain unavailable. `PI_GUARD_MODE=strict` disables page evaluation and restricts navigation to localhost.

If Playwright reports that no browser executable is available, install Chromium once outside the normal agent session:

```bash
npx -y playwright install chromium
```

Use the browser version already installed by a real project when possible.

## Language server setup

Check available servers:

```text
/lsp status
```

Install only the server required by the current project, for example:

```text
/lsp install vtsls
/lsp doctor vtsls
```

or:

```text
/lsp install pyright
/lsp doctor pyright
```

Missing language servers are not silently installed.

## Documentation search

`pi-doc-search` queries Context7 directly and keeps a persistent local cache. It works without a key at lower rate limits. For higher limits, set the key in your shell or user environment, never in the repository:

```bash
export CONTEXT7_API_KEY="ctx7sk-..."
```

Use `doc_search_resolve_library_id`, `doc_search_get_library_docs`, and `doc_search_get_cached_doc_raw` only when local source, installed types, and repository patterns do not answer a version-sensitive framework question.

## Web search

The included search extension does not require a model-native search provider.

Inspect or change the provider with:

```text
/web
```

Show current configuration:

```text
/web --show
```

The agent has two web tools:

- `web_search` for current external information;
- `web_fetch` for a specific public URL.

Do not commit search API keys or proxy credentials.

## Vision: DeepSeek primary plus delegated image model

The primary coding model stays:

```text
opencode-go/deepseek-v4-flash
```

DeepSeek V4 Flash is text-only, so image understanding is delegated through `describe_image` provided by `pi-vision-tool@1.3.7`.

The repository profile uses:

```text
Primary: opencode-go/deepseek-v4-flash
Vision:  opencode-go/qwen3.6-plus
```

`qwen3.6-plus` is intentionally used instead of `qwen3.7-plus` for this delegate path. The current Pi catalog exposes `qwen3.6-plus` as `openai-completions` with `text` and `image` input, while `pi-vision-tool` makes a direct OpenAI-compatible `/chat/completions` request. A delegate with a different API transport may not work through this extension even if the model itself is multimodal.

The model entry used for delegation must advertise image input:

```json
{
  "input": ["text", "image"]
}
```

### Default project profile

`.pi/models.env` pins the primary and delegate:

```bash
export PI_MAIN_MODEL="opencode-go/deepseek-v4-flash"
export PI_MAIN_THINKING="max"
export PI_VISION_PROVIDER="opencode-go"
export PI_VISION_MODEL="qwen3.6-plus"
export PI_VISION_REASONING_EFFORT="low"
```

The same authenticated `opencode-go` provider can therefore serve the text-only primary and the image-capable delegate.

### Configure interactively

`pi-vision-tool` also supports a persistent user-level configuration. In Pi:

```text
/vision config provider opencode-go
/vision config model qwen3.6-plus
/vision config reasoning-effort low
/vision
```

Persistent settings are stored in:

```text
~/.pi/agent/vision-tool.json
```

If that file exists, its values take priority over the legacy `PI_VISION_*` environment variables. Credentials remain in Pi's normal authentication store and must never be committed.

Enable or disable the delegate tool with:

```text
/vision on
/vision off
```

### Using `describe_image`

For a saved screenshot, ask the text-only primary to call `describe_image` with a focused question. Example:

```text
Use describe_image on .artifacts/playwright/page.png and identify layout, RTL, overflow, spacing, and visible interaction defects.
```

The calling model controls the image request. Typical choices:

- `compress: true` for ordinary UI screenshots and faster calls;
- `compress: false` when small text or pixel-level detail matters;
- `reasoning: low` for basic UI inspection;
- `reasoning: medium` or `high` only for genuinely complex visual analysis.

Supported image inputs include PNG, JPEG, GIF, WebP, BMP, file paths, data URLs, and raw base64. SVG should be rendered to PNG first when visual inspection is required.

### Vision smoke test

After startup:

```text
/vision
```

Then test a small PNG:

```text
Use describe_image on /tmp/test.png and report exactly what is visible.
```

If delegation fails, verify these in order:

1. `opencode-go` authentication works for the primary;
2. the delegate resolves as `opencode-go/qwen3.6-plus`;
3. the delegate advertises `input: ["text", "image"]`;
4. no stale `~/.pi/agent/vision-tool.json` overrides the project profile;
5. the image is a supported raster format or has been rendered to PNG first.

Do not add `@getpipher/vision` alongside `pi-vision-tool`; both expose image-routing behavior and duplicate vision extensions can conflict.

## Recommended smoke checks

After setup:

```text
/todos
/lsp status
/mcp status
/web --show
/vision
```

Then test capabilities with bounded requests:

```text
Use doc_search_resolve_library_id to resolve the React documentation library ID. Do not fetch broad documentation yet.
```

```text
Use the MCP proxy to locate the Playwright snapshot tool. Do not navigate.
```

```text
Use describe_image on a small local PNG with a focused visual question.
```

## Updating packages

Package versions are pinned for reproducibility. Review release notes before changing a pin. After intentionally updating pins:

```text
/reload
```

then run:

```bash
bash scripts/pi-doctor.sh
```
