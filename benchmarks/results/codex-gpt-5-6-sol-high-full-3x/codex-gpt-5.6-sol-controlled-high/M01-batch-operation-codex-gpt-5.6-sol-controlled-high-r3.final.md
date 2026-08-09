Implemented the batch operation across the service and command adapter.

- `processBatch(items)` now returns ordered success/failure entries, continues after errors, and reuses `processItem`.
- `runBatchCommand({ items })` now returns `{ results }` using the batch service.
- Added tests for validation failures, continuation, ordering, mixed command results, and empty input.
- `npm test` passes all 4 tests.