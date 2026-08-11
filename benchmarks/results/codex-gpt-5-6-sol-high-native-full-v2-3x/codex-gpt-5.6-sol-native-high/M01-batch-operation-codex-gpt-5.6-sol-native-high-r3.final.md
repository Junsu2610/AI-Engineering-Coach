[2026-08-11 19:17:45] Implemented the batch operation.

- `processBatch(items)` reuses `processItem`, preserves order, captures per-item errors, and continues processing.
- `runBatchCommand(payload)` delegates to `processBatch`.
- Added coverage for mixed outcomes, exact error messages, continuation, ordering, and empty input.
- No dependencies added.
- Verification: `npm test` — 4/4 tests passed.
- `git diff --check` passed.