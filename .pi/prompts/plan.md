---
description: Create or update the smallest safe implementation plan
argument-hint: "<goal>"
---

Analyze this goal and write the bounded plan to `docs/PLAN.md`:

$ARGUMENTS

Inspect `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and only relevant code.

Use the `planner` or `scout` subagent when cross-module discovery is needed. Do not implement application code.

The plan must contain:

1. Goal and explicit non-goals
2. Confirmed facts, constraints, and assumptions
3. Existing patterns and components to reuse
4. Smallest viable design and data/control flow
5. Security, correctness, performance, UX, migration, and rollback risks
6. Ordered vertical slices with observable acceptance checks
7. Verification strategy
8. Decisions intentionally deferred
