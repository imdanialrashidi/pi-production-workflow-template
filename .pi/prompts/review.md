---
description: Independently review the current diff for material release risk
argument-hint: "[scope]"
---

Review the current working-tree diff. Scope hint:

${ARGUMENTS:-all current changes}

Load `risk-review`. Delegate to `reviewer`; also use `security-auditor` when a trust boundary, money, access, migration, secret, upload, callback, deployment, or data-integrity behavior changed.

Use concrete repository evidence. Do not edit files during the review.

Report only actionable findings with severity, `file:line` or symbol evidence, failure scenario, smallest safe fix, and proof test. End with exactly one verdict:

`PASS`, `PASS WITH FIXES`, or `BLOCK`.
