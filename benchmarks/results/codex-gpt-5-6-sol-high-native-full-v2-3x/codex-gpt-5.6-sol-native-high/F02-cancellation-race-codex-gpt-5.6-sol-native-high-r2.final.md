[2026-08-11 18:57:16] Fixed the race in [src/latest-task.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-6v4DjJ\workspace with spaces\src\latest-task.mjs:5>).

Stale tasks now skip `applyResult` and return `applied: false`. The exported API and worker boundary remain unchanged.

Verification: `npm test` — 1 passed, 0 failed. `git diff --check` also passed.