---
description: Run the final local release-readiness gate without deploying
argument-hint: "[release scope]"
---

Prepare the current change for handoff. Scope:

${ARGUMENTS:-current working-tree change}

Do not add features, deploy, push, publish, commit, or rewrite unrelated code.

1. Re-read the accepted goal and inspect the full diff.
2. Confirm no secret, private specification, generated artifact, debug bypass, or unrelated change is included.
3. Load `verification-routing` and run the canonical full verification gate once.
4. For high-risk changes, require a completed independent review with no unresolved BLOCKER or MAJOR finding.
5. Return the release summary, exact checks and outcomes, known limitations, rollback note, and manual verification steps.
