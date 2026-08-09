Implemented the batch operation across the service, command adapter, and tests.

- `processBatch(items)` processes every item in order, returns success/failure result objects, and continues after failures.
- `runBatchCommand(payload)` now delegates to `processBatch`.
- Added adapter coverage for mixed successful and failed items.
- `npm test` passes: 3 tests.

Changed files: `src/item-service.mjs`, `src/command-adapter.mjs`, `test/batch-operation.test.mjs`.