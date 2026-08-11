[2026-08-11 19:19:32] Fixed the cross-page filter regression.

- [filter-page.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-TFoGT3\workspace with spaces\src\filter-page.mjs:1>) and [filter-panel.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-TFoGT3\workspace with spaces\src\filter-panel.mjs:1>) now use the canonical `readFilter()` accessor.
- [filter-state.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-TFoGT3\workspace with spaces\src\filter-state.mjs:1>) was already correct: it stores data at `state.filter`.
- `filter-legacy.mjs` reads the separate `legacyFilters` branch and is not imported by either consumer.
- The 160 `src/distractors/filter-*.mjs` modules only export unrelated constants and are absent from the import graph.

Verification: `npm test` passes 2/2; `git diff --check` passes. Only the two consumers changed.