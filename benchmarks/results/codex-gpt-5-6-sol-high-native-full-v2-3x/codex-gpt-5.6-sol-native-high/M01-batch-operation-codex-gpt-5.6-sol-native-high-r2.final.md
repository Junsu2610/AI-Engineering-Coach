[2026-08-11 18:59:00] Implemented the batch operation:

- `processBatch` reuses `processItem`, preserves input/error order, and continues after failures.
- `runBatchCommand` delegates to `processBatch`.
- Tests cover mixed outcomes, exact errors, ordering, and empty input.
- `npm test`: 3/3 passed.
- `git diff --check`: passed.

No dependencies added; single-item behavior and exports remain unchanged.