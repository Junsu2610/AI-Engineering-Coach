[2026-08-11 18:38:15] Fixed the cancellation race in [latest-task.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-H1xx8X\workspace with spaces\src\latest-task.mjs:8>).

Stale results are now returned with `applied: false` without calling `applyResult`. The exported API and worker boundary remain unchanged.

Verification: `npm test` — 1 passed, 0 failed.