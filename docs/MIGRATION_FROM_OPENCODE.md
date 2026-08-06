# Migration from OpenCode

This repository was converted from an OpenCode-specific workflow to a Pi-native workflow.

## Removed

- `opencode.jsonc`
- `.opencode/`
- `oc`

These files represented OpenCode agents, permissions, MCP routing, prompts, skills, and model switching.

## Pi replacements

| OpenCode concept | Pi replacement |
|---|---|
| `opencode.jsonc` | `.pi/settings.json`, extensions, skills, and launcher flags |
| `AGENTS.md` | retained as the shared repository contract |
| `.opencode/prompts/*` | `.pi/prompts/*` |
| `.opencode/skills/*` | `.pi/skills/*` |
| `build` primary agent | main Pi session |
| `plan` primary agent | `/plan` prompt + planner subagent |
| `explore` subagent | Scout through `pi-sub-agent` |
| `reviewer` subagent | Reviewer through `pi-sub-agent` |
| OpenCode permission map | `.pi/extensions/safety-guard.js` plus OS isolation when required |
| Context7/Playwright MCP | local repository tools and skills; add reviewed Pi extensions only when needed |
| `.opencode/models.env` | `.pi/models.env` + `/model` + `/sub-agent-settings` |
| `./oc` | `./p` |

## Local migration steps

After merging the workflow change:

```bash
git pull
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
bash scripts/pi-doctor.sh
./p
```

Review and trust the project when Pi prompts. Restart or use `/reload` after trust is recorded.

Authenticate:

```text
/login
```

Choose the main model:

```text
/model
```

Configure role models:

```text
/sub-agent-settings
```

## Existing product projects

Copy these paths into an existing project:

```text
AGENTS.md
p
.pi/
scripts/pi-doctor.sh
```

Also merge:

```text
.gitignore
.github/workflows/quality.yml
README.md or project workflow documentation
```

Keep the project's existing test, build, deployment, and verification scripts. Run `/bootstrap` so Pi detects and documents the real stack without changing product behavior.

## Security difference

Pi project trust is not a sandbox. The safety extension blocks the most dangerous tool calls, but stronger isolation requires a container, VM, or restricted development user.

Do not assume the former OpenCode permission model transfers automatically. Review `.pi/extensions/safety-guard.js` and test it before using production credentials.

## Rollback

Before migration, tag or record the last OpenCode commit.

To return to the old workflow:

```bash
git checkout <last-opencode-commit> -- opencode.jsonc .opencode oc
```

Then remove or disable `.pi/` and `p` in a separate reviewed change.
