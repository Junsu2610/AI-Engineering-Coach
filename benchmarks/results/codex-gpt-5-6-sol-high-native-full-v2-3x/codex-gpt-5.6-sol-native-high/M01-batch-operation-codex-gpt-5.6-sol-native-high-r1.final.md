[2026-08-11 18:39:15] Implemented the batch operation.

- `processBatch(items)` now reuses `processItem`, preserves input/error ordering, and continues after failures.
- `runBatchCommand(payload)` delegates to `processBatch`.
- Added adapter, mixed-result, and empty-input coverage.
- Preserved existing exports and exact single-item error messages.

Verification: `npm test` — 3 tests passed, 0 failed.