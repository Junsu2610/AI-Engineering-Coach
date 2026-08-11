[2026-08-11 19:16:21] Fixed the cancellation race in [latest-task.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-NMhCFB\workspace with spaces\src\latest-task.mjs:5>).

Stale results now skip `applyResult`; the exported API and worker boundary remain unchanged.

Verification: `npm test` — 1 passed, 0 failed.