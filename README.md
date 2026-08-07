# Pi Production Workflow Template

A compact, evidence-driven harness for [Pi Coding Agent](https://pi.dev/) focused on high-quality autonomous implementation, bounded independent evaluation, low-resource verification, and production-safe guardrails.

## What this template provides

- a short progressive-disclosure map in `AGENTS.md` instead of a giant always-loaded manual;
- a detailed on-demand harness playbook in `docs/HARNESS.md`;
- a project quality/evaluator contract in `docs/QUALITY.md`;
- acceptance-driven `/build`, `/review`, and `/ship` workflows;
- durable execution plans plus `/handoff` and `/resume` for long-running work across fresh contexts;
- Pi-native project settings in `.pi/settings.json`;
- a project launcher (`./p`) with the required tool allowlist;
- bounded read-heavy subagents through the pinned `pi-sub-agent` package;
- on-demand LSP, Context7 documentation, web search/fetch, and image analysis;
- lazy Playwright MCP browser exploration through a restricted proxy tool;
- repository-local Playwright Test (when the real project uses it) for durable regression coverage;
- a visible todo panel for genuinely multi-step work;
- a project-local safety extension that blocks secrets, destructive commands, production mutation, Git history mutation, unsafe MCP calls, and accidental harness-policy edits;
- specialized skills for verification routing, risk review, and browser QA;
- a doctor/CI check that validates package pins, security posture, and always-loaded context budgets.

## Harness philosophy

The workflow follows a simple loop:

```text
intent
→ classify
→ acceptance contract
→ focused discovery
→ one primary writer
→ targeted verification
→ independent evaluator when justified
→ bounded repair
→ final gate
→ acceptance → evidence report
```

For long-running work:

```text
execution plan
→ incremental work
→ /handoff
→ fresh context
→ /resume
```

The design intentionally avoids agent swarms and giant skill packs. Extra orchestration is added only where it solves a demonstrated failure mode.

See [`docs/PI_WORKFLOW.md`](docs/PI_WORKFLOW.md) and [`docs/HARNESS.md`](docs/HARNESS.md) for the architecture and operating playbook.

## Install

Install Pi:

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

Validate the template:

```bash
bash scripts/pi-doctor.sh
```

Start Pi:

```bash
./p
```

The first time Pi sees project-local resources, review and trust `.pi/settings.json`, `.pi/extensions/`, `.pi/skills/`, `.pi/prompts/`, and `.mcp.json`. Pi then installs the pinned project packages.

Complete the one-time tool setup in [`docs/TOOLING_SETUP.md`](docs/TOOLING_SETUP.md).

Authenticate:

```text
/login
```

Select a model:

```text
/model
```

To pin a model for this repository, edit `.pi/models.env`:

```bash
export PI_MAIN_MODEL="provider/model-id"
export PI_MAIN_THINKING="high"
```

Do not put API keys in `.pi/models.env`.

## Daily usage

Start:

```bash
./p
```

For an ordinary task, a natural prompt is enough:

```text
Implement this behavior completely and verify it.
```

Reusable workflows:

```text
/build <accepted task>
/plan <complex goal>
/review [scope or acceptance contract]
/ship [scope or execution plan]
/handoff <active execution plan or task>
/resume <docs/exec-plans/active/...md>
/bootstrap [project constraints]
```

Reload project resources:

```text
/reload
```

## Task routing

The harness distinguishes four levels:

- **Localized:** direct inspect → change → targeted check; no ceremony.
- **Standard:** compact acceptance contract, one vertical slice, verification, independent evaluation where useful.
- **Complex:** `/plan` plus a durable execution plan when work must survive context/session boundaries.
- **High risk:** explicit acceptance, risk/security review, negative-path evidence, and full verification before completion.

For Standard or larger work, the acceptance contract contains 3–7 observable criteria and proof required for each. This same contract drives implementation, review, browser QA, and the final report.

## Automatic subagents

The main agent remains the only writer.

It may automatically use:

- `scout` when the relevant repository surface or cross-module flow is genuinely unclear;
- `reviewer` after non-trivial user-facing work, cross-module changes, production-bug fixes, or material regression-risk changes;
- `security-auditor` after trust-boundary, money, access, migration, secret, upload, callback, deployment, or data-integrity changes.

Independent evaluation is bounded: by default, no more than two evaluator/repair rounds before the agent must reassess the root cause/contract or report a real blocker.

Configure subagent models with:

```text
/sub-agent-settings
```

Recommended posture:

- Scout: cheap/fast model, low thinking
- Reviewer: strong model, high thinking
- Security auditor: strong model, high thinking
- Parent implementation session: strongest cost-effective coding model

## Production tool stack

The template pins:

```text
pi-sub-agent
pi-mcp-adapter
rpiv-todo
pi-lsp-adapter
pi-context7
pi-image-subagent
pi-web-search
```

The launcher exposes only the required tools. The MCP adapter exposes a compact `mcp` proxy, and Playwright schemas are discovered only when needed.

Useful checks:

```text
/todos
/lsp status
/mcp status
/web --show
```

See [`docs/TOOLING_SETUP.md`](docs/TOOLING_SETUP.md) for LSP, Context7, search, vision, and Playwright setup.

## Context and long-running work

`AGENTS.md` is a map, not an encyclopedia. `scripts/pi-doctor.sh` enforces an always-loaded size budget so detailed guidance must live in docs/skills instead of silently consuming task context.

For complex work, use `docs/exec-plans/active/`. The plan stores accepted criteria, verified state, decisions, evidence, risks, and the next action—not raw transcripts.

When old context becomes noisy or the task must cross sessions:

```text
/handoff docs/exec-plans/active/my-task.md
```

Start a fresh session, then:

```text
/resume docs/exec-plans/active/my-task.md
```

The fresh agent validates the plan against the working tree before continuing.

## Failure recovery

The agent must not repeat the same failed approach indefinitely. After the same approach/check fails twice without materially new evidence, it should:

- preserve the exact failure;
- state competing root-cause hypotheses;
- gather the cheapest discriminating evidence;
- use semantic/local evidence before broad external research;
- use one focused independent investigation if needed;
- hand off to a fresh context when stale history is becoming harmful.

Recurring failure classes should become tests, types/schemas, lint/structural checks, clearer APIs/tools, or focused docs—not more generic prompt text.

## Safety model

Pi project trust is not a sandbox. Pi runs with the operating-system permissions of the account that starts it.

`.pi/extensions/safety-guard.js` blocks:

- sensitive credential and private-key paths;
- destructive recursive deletion;
- privilege escalation and host service mutation;
- Git commit/push/history mutation;
- global package installation and publishing;
- remote shell, deployment, infrastructure, and production database commands;
- writes outside the repository;
- accidental edits to harness-policy files;
- unsafe Playwright MCP tools and non-local browser navigation.

For explicit harness maintenance:

```bash
PI_WORKFLOW_EDIT=1 ./p
```

Review the diff before keeping harness changes. For stronger isolation, use a container, VM, or dedicated development account.

## Verification

The `verification-routing` skill chooses the cheapest reliable lane.

During implementation:

- exact affected test;
- changed/related tests;
- fast verification;
- one affected browser spec where relevant.

After a bounded slice:

- feature verification once.

Before final delivery or after High-risk changes:

- full verification once.

Generic full entrypoint:

```bash
bash scripts/verify.sh
```

A real project can provide `scripts/project-verify.sh` to replace the generic detector with its canonical gate.

## Browser and visual QA

Browser work has two layers:

- Playwright MCP for interactive exploration, accessibility snapshots, console/network inspection, and focused actions;
- repository-local Playwright Test for deterministic regression coverage and CI.

Local development policy:

- no `CI=1`;
- one relevant browser project;
- one worker;
- zero retries;
- video/trace/automatic screenshots off;
- reuse servers;
- run a specific spec.

Use screenshots only when appearance materially matters; use the image subagent only when visual interpretation adds value.

## Repository layout

```text
.
├── AGENTS.md
├── .mcp.json
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
│   │   ├── ship.md
│   │   ├── handoff.md
│   │   └── resume.md
│   └── skills/
│       ├── browser-qa/
│       ├── risk-review/
│       └── verification-routing/
├── docs/
│   ├── HARNESS.md
│   ├── QUALITY.md
│   ├── PI_WORKFLOW.md
│   ├── TOOLING_SETUP.md
│   └── exec-plans/
│       └── README.md
├── scripts/
└── .github/workflows/quality.yml
```

## New-project workflow

1. Create a repository from this template.
2. Add/import the real product source.
3. Run `./p` and review/trust project resources.
4. Complete `docs/TOOLING_SETUP.md` once for the machine/project.
5. Run `/bootstrap` to make product, architecture, quality, verification, and runtime interfaces project-specific.
6. Deliver bounded slices with `/build`.
7. Use `/plan` only for work that genuinely needs durable design/execution state.
8. Use `/review` when independent evaluation adds value.
9. Use `/handoff` + `/resume` for long-running work across clean contexts.
10. Use `/ship` for final local acceptance/release readiness.

## Updating Pi and packages

Pi:

```bash
pi update --self
```

Project packages:

```bash
pi update --extensions
```

Packages are pinned in `.pi/settings.json`. Update a pin only after reviewing the release and testing it in a disposable branch.

## Research basis

The harness design is informed by public engineering work from OpenAI and Anthropic on harness engineering, context engineering, long-running agents, evaluator/optimizer loops, tool design, and repository-as-system-of-record practices, plus SWE-agent research on agent-computer interfaces. See `docs/HARNESS.md` for the specific design mapping.

## License

Use this template under the repository's chosen license.
