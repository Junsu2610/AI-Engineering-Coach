Implemented the batch operation end to end.

- `processBatch(items)` reuses `processItem`, preserves input/error order, and continues after failures.
- `runBatchCommand(payload)` now delegates to `processBatch`.
- Added coverage for mixed results, both error types, continuation, empty input, and adapter output.
- Preserved `processItem`, exports, and exact error messages.
- `npm test`: 4 tests passed.