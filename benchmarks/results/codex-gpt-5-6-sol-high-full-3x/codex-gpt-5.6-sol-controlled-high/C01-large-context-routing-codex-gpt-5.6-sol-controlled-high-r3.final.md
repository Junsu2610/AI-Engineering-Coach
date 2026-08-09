Fixed the cross-page filter regression by updating both active consumers to read the shared singular `state.filter` branch:

- [src/filter-panel.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-QpLPRN\workspace%20with%20spaces\src\filter-panel.mjs:2)
- [src/filter-page.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-QpLPRN\workspace%20with%20spaces\src\filter-page.mjs:2)

The shared state contract in [src/filter-state.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-QpLPRN\workspace%20with%20spaces\src\filter-state.mjs:4) already writes and reads `filter`, so it did not need modification. `filter-legacy.mjs` uses the separate `legacyFilters` branch and is not imported by either active consumer. The numbered `src/distractors/filter-*.mjs` modules only export unrelated constants and are also not part of the routing path.

`npm test` passes: 2 tests, 0 failures.