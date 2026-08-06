---
name: browser-qa
description: Efficient browser and visual QA for user-facing changes. Use when layout, interaction, accessibility, responsive behavior, visual regression, or browser-only behavior matters.
---

# Browser QA

Use real browser evidence only where browser behavior matters.

## Order of operations

1. Reproduce the affected user journey with the narrowest existing browser test or local server.
2. Inspect console errors, failed requests, accessibility semantics, and visible state.
3. Capture screenshots only when layout or appearance is materially relevant.
4. Fix the smallest confirmed defect.
5. Add or update a deterministic regression test.
6. Rerun the affected spec or last failed tests.
7. Run the feature lane once at completion.

## Local resource policy

- Never set `CI=1`.
- Use one relevant browser project and one worker.
- Use zero retries and fail fast.
- Keep video, trace, and automatic screenshots off.
- Reuse running servers.
- Do not build unrelated applications.
- Avoid fixed sleeps; use locator assertions, events, or response conditions.
- Avoid `networkidle` as a general readiness signal.
- Prepare server state through fixtures or APIs rather than repeated UI setup.

## Visual quality

Check:

- mobile and desktop critical viewport;
- RTL/LTR where applicable;
- overflow, clipping, spacing, hierarchy, and typography;
- loading, empty, error, disabled, success, and permission states;
- keyboard navigation, focus, labels, semantics, contrast, touch targets, and reduced motion;
- long text and realistic data.

Do not create decorative copy merely to explain obvious UI. Supporting text must prevent ambiguity or error and must add information.

## Test placement

Use unit/integration tests instead of browser E2E for pure sorting, filtering, mapping, formatting, validation, reducers, calculations, or state transitions.
