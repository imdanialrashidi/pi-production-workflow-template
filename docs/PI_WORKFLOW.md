# Pi Workflow Architecture

## Objective

Optimize for fast completion of correct, production-safe vertical slices on modest local hardware.

The workflow deliberately avoids a large agent organization. Coordination overhead, repeated exploration, and repeated full test suites commonly cost more than they save.

## Layers

### 1. Durable context: `AGENTS.md`

`AGENTS.md` is always loaded. It contains only stable repository rules:

- source-of-truth order;
- autonomy and hard stops;
- architecture and security invariants;
- UI copy discipline;
- testing truthfulness;
- Git and release safety;
- definition of done.

Long operational procedures do not belong there.

### 2. Parent-only execution policy: `.pi/APPEND_SYSTEM.md`

This file tells the primary session how to:

- route to subagents automatically;
- keep one writer;
- load relevant skills;
- choose verification lanes;
- avoid scope expansion;
- protect workflow files.

### 3. On-demand procedures: `.pi/skills/`

Skills are loaded only when relevant:

- `verification-routing` — targeted, feature, and full lanes;
- `risk-review` — evidence-based high-risk review;
- `browser-qa` — low-resource browser and visual verification.

### 4. User-invoked workflows: `.pi/prompts/`

Prompt templates provide stable slash commands without introducing a second orchestration framework:

- `/build`
- `/plan`
- `/review`
- `/ship`
- `/bootstrap`

### 5. Delegation: `pi-sub-agent`

The package is pinned and project-managed through `.pi/settings.json`.

Use:

- Scout for repository reconnaissance;
- Reviewer for independent clean-context review;
- Security auditor for high-risk trust-boundary review.

Avoid implementation subagents by default. Concurrent agents writing shared files create merge conflicts, inconsistent architecture, and duplicate verification.

### 6. Deterministic guardrail: `safety-guard.js`

Prompt instructions are not enforcement. The extension blocks tool calls that would:

- expose secrets;
- mutate workflow policy accidentally;
- destroy broad filesystem state;
- rewrite Git history or push;
- deploy or publish;
- mutate infrastructure or production.

Pi project trust remains separate: trusting a repository permits loading the extension; it does not sandbox the process.

## Context strategy

Keep the main session focused:

- use exact paths and symbols;
- delegate broad discovery once;
- load skills lazily;
- use `/compact` after a major milestone when context becomes noisy;
- use `/fork` or `/clone` for an alternative direction rather than mixing incompatible plans;
- start a new session for a new unrelated task.

## Model strategy

The template does not hardcode a provider.

Recommended allocation:

| Role | Model posture |
|---|---|
| Main implementation | strongest cost-effective coding model |
| Scout | fast, inexpensive model; low thinking |
| Reviewer | stronger model; high thinking |
| Security auditor | stronger model; high thinking |
| Planning | parent model or planner subagent; high thinking |

Use `/sub-agent-settings` for role-specific models.

## Verification strategy

Fast feedback is more important than repeated exhaustive gates.

### Targeted lane

Run after coherent implementation steps:

- exact test;
- related tests;
- typecheck/static check;
- affected browser spec.

### Feature lane

Run once after the bounded slice:

- static checks;
- full unit/integration tests;
- relevant build;
- small E2E smoke set.

### Full lane

Run once at final handoff or after high-risk changes:

- canonical repository gate;
- migrations/deployment checks;
- full critical E2E;
- security/release checks.

## What is intentionally not included

- MCP by default;
- parallel write-capable agents;
- vector memory;
- automatic commits, pushes, releases, or deployment;
- video recording in local browser tests;
- a second specification framework;
- automatic package marketplace installation;
- hidden background shells.

Each can be added later only when a real measured need justifies its cost and risk.

## Evaluation

Benchmark changes with real repository tasks:

- acceptance tests passed;
- wall-clock time;
- model/API cost;
- human interventions;
- regressions;
- diff size;
- number of fix loops;
- peak memory.

Keep a workflow addition only when it improves these measures over several tasks.
