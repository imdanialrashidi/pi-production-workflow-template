---
description: Adapt the generic Pi workflow to the current repository stack
argument-hint: "[project constraints]"
---

Bootstrap this repository for efficient Pi-assisted development.

Additional constraints:

${ARGUMENTS:-none}

Do not change product behavior.

Inspect the real package manager, languages, workspaces, test frameworks, browser/E2E setup, databases, CI, deployment scripts, and existing verification commands.

Then:

1. Fill `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and `docs/PLAN.md` only with confirmed project-specific facts or clearly marked placeholders.
2. Create stack-specific fast, feature, and full verification lanes without weakening the canonical gate.
3. For Playwright, create a low-resource local lane with no CI mode, video, trace, or automatic screenshots; reuse servers and run the narrowest spec.
4. Preserve existing tests and CI requirements.
5. Update project documentation with exact commands.
6. Run static validation and the cheapest available smoke checks.
7. Report files changed, commands created, checks run, blockers, and remaining bottlenecks.

Do not install a second framework, expose secrets, create commits, deploy, or modify Pi workflow policy files unless necessary for stack adaptation.
