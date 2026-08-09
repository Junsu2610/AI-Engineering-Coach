Fixed the stale-result cancellation race in [src/latest-task.mjs](<C:/Users/ptd26/AppData/Local/Temp/aic-agent-benchmark-qVQVsn/workspace with spaces/src/latest-task.mjs:5>).

- Results are applied only when their generation is still current.
- Exported API and worker boundary remain unchanged.
- `npm test` passes: 1 test, 0 failures.