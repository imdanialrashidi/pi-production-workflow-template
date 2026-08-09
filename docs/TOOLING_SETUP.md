# Production Tooling Setup

This template pins a small production-oriented Pi tool stack. Project packages are installed by Pi after the repository is trusted.

The reviewed Pi pin requires Node.js 22.19.0 or newer. The included CI pins Node 22.23.2; the container pins Node 24.19.0 on Debian Bookworm slim.

## Included packages

- `pi-sub-agent@0.1.5`
- `pi-mcp-adapter@2.20.1`
- `@juicesharp/rpiv-todo@2.1.0`
- `pi-lsp-adapter@0.1.3`
- `@dreki-gg/pi-doc-search@0.3.2`
- `@bytetrue/pi-vision@0.2.0`
- `@bytetrue/pi-web-search@0.1.3`

The project MCP configuration pins `@playwright/mcp@0.0.79` and exposes a restricted browser tool set through the single `mcp` proxy.

## First startup

```bash
./p
```

Review and trust the project-local Pi resources when prompted. Pi then installs missing pinned packages into its project runtime.

Reload after installation:

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

The agent should use todos only for work with at least four meaningful steps, cross-module work, sessions likely to exceed fifteen minutes, or work that may survive compaction.

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

For actual browser QA, start the project's local application first, then ask Pi to navigate to its localhost URL. Browser actions use accessibility snapshots. Screenshots are reserved for appearance-related evidence and are saved under `.artifacts/playwright/`.

The project intentionally hides:

- arbitrary page JavaScript evaluation;
- file upload;
- drag-and-drop file injection;
- MCP JavaScript scripting.

It also uses an isolated in-memory profile and blocks service workers. The localhost origin allowlist is an accident-reduction measure, not a network sandbox and not redirect containment; use `SECURITY.md` isolation guidance when egress is sensitive.

If Playwright reports that no browser executable is available, install Chromium once outside the normal agent session:

```bash
npx -y playwright install chromium
```

Use the version already installed by a real project when possible.

## Language server setup

Check available servers:

```text
/lsp status
```

Install only the server required by the current project. Examples:

```text
/lsp install vtsls
/lsp doctor vtsls
```

```text
/lsp install pyright
/lsp doctor pyright
```

The default install mode is explicit/prompted; missing language servers are not silently installed.

## Documentation search

The maintained `pi-doc-search` package queries Context7 directly and keeps a persistent local cache. It works without a key at lower rate limits. For higher limits, set the key in your shell or user environment, never in the repository:

```bash
export CONTEXT7_API_KEY="ctx7sk-..."
```

Use `doc_search_resolve_library_id`, `doc_search_get_library_docs`, and `doc_search_get_cached_doc_raw` only when local source, installed types, and repository patterns do not answer a version-sensitive framework question.

## Web search

The included search extension does not require DeepSeek or a model-native search provider.

Default search is keyless Exa with automatic fallback to keyless Bing. Inspect or change the provider with:

```text
/web
```

Show current configuration:

```text
/web --show
```

For a restricted network, configure a proxy through `/web` or the package's user-level configuration. Do not commit search API keys or proxy credentials.

The agent has two tools:

- `web_search` for current external information;
- `web_fetch` for a specific public URL.

## Vision setup

List image-capable models available in your Pi installation:

```bash
pi --list-models | rg -i 'image|vision|luna|gemini|gpt'
```

Configure the maintained vision package from Pi:

```text
/vision
```

Choose an exact image-capable model already present in `models.json`. Automatic attachment analysis is intentionally off by default; enable it only when wanted:

```text
/vision auto on
```

For deterministic visual QA, keep automatic mode off and call `image_ask` with one or more local screenshot paths plus a focused question. The package stores no provider credentials. Authenticate providers through Pi's normal `/login` flow and do not commit keys.

## Recommended smoke checks

After setup:

```text
/todos
/lsp status
/mcp status
/web --show
```

Then test capabilities with bounded requests:

```text
Search the web for the current official Pi package documentation and return source links.
```

```text
Use `doc_search_resolve_library_id` to resolve the React documentation library ID. Do not fetch broad documentation yet.
```

```text
Use the MCP proxy to locate the Playwright snapshot tool. Do not navigate.
```

For image analysis, provide a small local screenshot path and ask Pi to call `image_ask` with a focused visual question.

## Updating packages

Package versions are pinned for reproducibility. Review release notes before changing a pin. After intentionally updating the pins:

```text
/reload
```

and run:

```bash
bash scripts/pi-doctor.sh
```
