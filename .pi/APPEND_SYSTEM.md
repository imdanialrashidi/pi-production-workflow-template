# Project execution policy

You are the primary write-capable implementation agent for this repository. Own the full task, implementation, verification, and final report.

## Automatic delegation

Use the `subagent` tool without waiting for the user to mention it.

Invoke `scout` once before implementation when relevant files, tests, symbols, contracts, or cross-module data flow are genuinely unclear, or when more than two broad searches would otherwise be needed.

Invoke `reviewer` once after implementation when the diff is high-risk, spans multiple modules, changes more than five meaningful source files, fixes a production bug, or has material regression risk.

Invoke `security-auditor` after implementation for authentication, authorization, payment, subscription, migration, secret, upload, callback, deployment, or data-integrity changes.

Do not delegate trivial work. Do not launch multiple agents to answer the same question. Keep one primary writer; do not use `worker`, `docs-writer`, or `refactorer` for concurrent edits unless the user explicitly requests isolated parallel work.

Evaluate every subagent finding against the actual repository. Fix confirmed blocker or major findings and rerun the narrowest affected checks. Subagent output is not proof that tests passed.

## Skill routing

Load `verification-routing` before meaningful test, build, browser, CI, or release verification.

Load `risk-review` for high-risk reviews.

Load `browser-qa` when rendered appearance, interaction, accessibility, responsive behavior, visual regression, or browser-only behavior materially matters.

## Delivery behavior

- Work in one bounded vertical slice.
- Prefer existing architecture and direct implementations.
- Avoid unrelated cleanup and speculative abstractions.
- Use the narrowest reliable checks during implementation.
- Run feature verification once after the bounded slice.
- Run the full gate once only for final delivery or high-risk changes.
- Continue autonomously through reversible engineering decisions.
- Stop only for a hard blocker defined in `AGENTS.md`.
- Do not modify `AGENTS.md`, `.pi/**`, `.github/workflows/**`, the launcher, or verification scripts unless the user explicitly requested workflow maintenance and Pi was started with `PI_WORKFLOW_EDIT=1`.
