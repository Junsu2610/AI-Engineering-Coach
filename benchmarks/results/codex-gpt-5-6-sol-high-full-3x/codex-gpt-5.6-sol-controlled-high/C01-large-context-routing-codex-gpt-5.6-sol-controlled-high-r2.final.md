Fixed the cross-page filter regression by updating both consumers to read the shared `state.filter.query` branch:

- [src/filter-page.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-J20azm\workspace%20with%20spaces\src\filter-page.mjs)
- [src/filter-panel.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-J20azm\workspace%20with%20spaces\src\filter-panel.mjs)

`src/filter-state.mjs` already writes and reads the canonical `filter` branch, so it did not require changes. `src/filter-legacy.mjs` uses the separate `legacyFilters` branch and is not imported by either consumer. The numbered distractor modules only export unrelated constants and are also not part of the routing path.

`npm test` passes: 2 tests passed.