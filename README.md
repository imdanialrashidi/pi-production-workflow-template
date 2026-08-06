# Pi Vibe Production Template

A minimal, evidence-driven workflow for [Pi Coding Agent](https://pi.dev/) that favors fast vertical slices, bounded delegation, explicit safety guardrails, and verification over agent ceremony.

> The repository name is historical. The workflow is now Pi-native and no longer depends on OpenCode.

## What this template provides

- concise repository-wide rules in `AGENTS.md`;
- Pi-native project settings in `.pi/settings.json`;
- a project launcher (`./p`) with the required tool allowlist;
- automatic read-heavy subagents through the pinned `pi-sub-agent` package;
- a project-local safety extension that blocks secrets, destructive commands, production mutation, Git history mutation, and accidental workflow-policy edits;
- prompt templates: `/build`, `/plan`, `/review`, `/ship`, `/bootstrap`;
- on-demand skills for verification routing, risk review, and browser QA;
- generic CI and full verification scripts that adapt to common stacks.

## Why this design

Pi intentionally keeps the core small. It does not prescribe MCP, plan mode, permission popups, subagents, or a todo system. This template implements only the pieces that materially improve delivery:

- one primary write-capable agent;
- isolated read-heavy Scout/Reviewer/Security subagents;
- no parallel shared-file writers;
- small always-loaded context;
- workflows loaded on demand through skills and prompt templates;
- a deterministic safety guard instead of relying only on prompt instructions;
- targeted verification during implementation and one full gate at delivery.

## Install

Install the official Pi package:

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

Validate the workflow:

```bash
bash scripts/pi-doctor.sh
```

Start Pi:

```bash
./p
```

The first time Pi sees project-local resources, approve/trust the project after reviewing `.pi/settings.json`, `.pi/extensions/`, `.pi/skills/`, and `.pi/prompts/`. Pi will install the pinned project package after trust is granted.

Authenticate from Pi:

```text
/login
```

Select a model:

```text
/model
```

The launcher uses the selected Pi model by default. To pin a model for this repository, edit `.pi/models.env`:

```bash
export PI_MAIN_MODEL="provider/model-id"
export PI_MAIN_THINKING="high"
```

Do not put API keys in `.pi/models.env`. Pi credentials belong in its global auth storage.

## Daily usage

Start:

```bash
./p
```

Normal prompt:

```text
Implement the smallest complete slice for the requested behavior and verify it.
```

Reusable commands:

```text
/build <accepted task>
/plan <goal>
/review [scope]
/ship [scope]
/bootstrap [project constraints]
```

Reload changed Pi resources without restarting:

```text
/reload
```

### Automatic subagents

The main agent automatically delegates when the task justifies it:

- `scout` before implementation when files, tests, contracts, or cross-module flow are unclear;
- `reviewer` after meaningful high-risk or multi-module implementation;
- `security-auditor` after trust-boundary, money, access, migration, secret, upload, callback, deployment, or data-integrity changes.

The primary agent remains the only writer. Subagents return evidence; they do not prove tests passed.

Configure subagent models and thinking levels:

```text
/sub-agent-settings
```

Recommended posture:

- Scout: cheap/fast model, low thinking
- Reviewer: strong model, high thinking
- Security auditor: strong model, high thinking
- Parent implementation session: strongest cost-effective coding model

## Safety model

Pi project trust is not a sandbox. Pi runs with the operating-system permissions of the current user.

This template adds `.pi/extensions/safety-guard.js`, which blocks:

- sensitive credential and private-key paths;
- destructive recursive deletion;
- privilege escalation and host service mutation;
- Git commit/push/history mutation;
- global package installation and publishing;
- remote shell, deployment, infrastructure, and production database commands;
- writes outside the repository;
- accidental edits to workflow policy files.

Workflow files are intentionally protected during normal feature work. For an explicit workflow-maintenance session:

```bash
PI_WORKFLOW_EDIT=1 ./p
```

Review the diff before keeping any workflow change.

For stronger isolation, run Pi inside a container, VM, or dedicated development account. The extension is a guardrail, not an operating-system sandbox.

## Verification

The main agent loads `verification-routing` and chooses the cheapest reliable lane.

During implementation:

- exact affected test;
- changed/related tests;
- fast verification;
- one affected browser spec.

After a bounded slice:

- feature verification once.

Before merge/release or after high-risk changes:

- full verification once.

The generic full entrypoint is:

```bash
bash scripts/verify.sh
```

Projects can provide `scripts/project-verify.sh` to replace the generic detector with their canonical gate.

## Browser and visual QA

Pi does not need MCP for the normal browser-testing workflow. The `browser-qa` skill uses repository-local Playwright or equivalent scripts through the shell.

For local development:

- no `CI=1`;
- one relevant browser project;
- one worker;
- zero retries;
- video/trace/automatic screenshots off;
- reuse servers;
- run a specific spec.

Use visual artifacts only when appearance materially matters.

## Repository layout

```text
.
├── AGENTS.md
├── p
├── .pi/
│   ├── APPEND_SYSTEM.md
│   ├── models.env
│   ├── settings.json
│   ├── extensions/
│   │   └── safety-guard.js
│   ├── prompts/
│   │   ├── bootstrap.md
│   │   ├── build.md
│   │   ├── plan.md
│   │   ├── review.md
│   │   └── ship.md
│   └── skills/
│       ├── browser-qa/
│       ├── risk-review/
│       └── verification-routing/
├── docs/
├── scripts/
└── .github/workflows/quality.yml
```

## New-project workflow

1. Copy the template into the new repository.
2. Fill or import the real product source.
3. Run `./p`.
4. Trust the project after reviewing Pi resources.
5. Run `/bootstrap`.
6. Review the generated project-specific docs and verification lanes.
7. Deliver one vertical slice at a time with `/build`.
8. Use `/review` for high-risk changes.
9. Use `/ship` for final local handoff.

## Updating Pi and packages

Pi itself:

```bash
pi update --self
```

Project packages:

```bash
pi update --extensions
```

The subagent package is pinned in `.pi/settings.json`. Update the pin only after reviewing the release and testing delegation in a disposable branch.

## Migration from the previous OpenCode workflow

See [`docs/MIGRATION_FROM_OPENCODE.md`](docs/MIGRATION_FROM_OPENCODE.md).

## License

Use this template under the repository's chosen license.
