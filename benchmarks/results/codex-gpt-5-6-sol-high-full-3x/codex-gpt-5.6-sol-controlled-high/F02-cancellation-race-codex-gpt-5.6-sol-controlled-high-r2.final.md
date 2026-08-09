Fixed the cancellation race in [latest-task.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-5alCq6\workspace with spaces\src\latest-task.mjs:5).

- Stale tasks no longer call `applyResult`.
- Return shape and worker boundary remain unchanged.
- `npm test` passes: 1/1 tests.