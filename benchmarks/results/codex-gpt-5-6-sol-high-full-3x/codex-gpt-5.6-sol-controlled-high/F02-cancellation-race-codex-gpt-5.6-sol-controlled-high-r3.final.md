Fixed the cancellation race in [src/latest-task.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-GzL1QB\workspace with spaces\src\latest-task.mjs:5>).

- Stale results now skip `applyResult`.
- Existing API and worker boundary remain unchanged.
- Supplied deterministic regression test passes with `npm test` (1/1).