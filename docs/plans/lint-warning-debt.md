# Lint Warning Debt Plan

## Current Baseline

- `npm run check` currently passes.
- `npm run lint` still emits warnings.
- Treat warning cleanup as incremental debt reduction, not as a rewrite.

## Guardrails

- Keep each cleanup batch small and reviewable.
- Do not change runtime behavior unless the change is covered by tests or new tests are added.
- Prefer mechanical fixes before structural refactors.
- Stop if a warning fix requires package changes, public API changes, or cross-cutting behavior changes.

## Phases

### Phase 1: Unnecessary Assertions

- Remove redundant non-null assertions and similar assertions where types already prove safety.
- Keep behavior identical.
- Add or update tests only if an assertion removal exposes real uncertainty.

### Phase 2: Import Order And Syntax Cleanups

- Fix import ordering warnings.
- Replace deprecated or discouraged `replaceAll` usage where lint requires a safer pattern.
- Replace discouraged `for-of` patterns with the approved alternative where the change is mechanical.
- Avoid mixing these edits with logic changes.

### Phase 3: `max-params` And Complexity Hot Spots

- Triage the highest-warning functions first.
- Prefer extracting well-named helpers over rewriting business logic.
- Keep function inputs and outputs stable unless tests prove the refactor.

### Phase 4: `max-lines` Large-File Decomposition

- Split oversized files only when the new boundaries are obvious and low-risk.
- Move cohesive utilities, types, or sections into adjacent modules.
- Preserve exports, behavior, and file-level responsibilities unless tested.

### Phase 5: Webview Rendering Function Splits

- Break up large webview rendering functions into smaller pure helpers.
- Keep HTML output and event wiring unchanged unless covered by tests.
- Re-check any rendering-sensitive area after each split.

## Suggested Execution Order

1. Land Phase 1 and Phase 2 first because they are the most mechanical.
2. Tackle Phase 3 only after the baseline warning count is lower.
3. Schedule Phase 4 and Phase 5 as separate review-sized tasks.

## Verification

- Run `npm run lint` on each warning-cleanup batch.
- Run any task-specific tests for touched areas.
- Reconfirm that runtime behavior did not change unless the task explicitly included tested behavior updates.
