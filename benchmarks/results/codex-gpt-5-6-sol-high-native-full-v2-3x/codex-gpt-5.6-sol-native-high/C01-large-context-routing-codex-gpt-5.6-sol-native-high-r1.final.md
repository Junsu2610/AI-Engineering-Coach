[2026-08-11 18:43:45] Fixed the regression in the smallest responsible set:

- [filter-page.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-pnHY5K\workspace with spaces\src\filter-page.mjs:1>)
- [filter-panel.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-pnHY5K\workspace with spaces\src\filter-panel.mjs:1>)

Both consumers now use the canonical `readFilter()` accessor. The shared state already correctly writes `state.filter`, so it remained unchanged.

Other similarly named modules are uninvolved:

- `filter-legacy.mjs` reads the separate `legacyFilters` branch and is not imported by the tested route.
- All 160 `src/distractors/filter-*.mjs` files have no references to the canonical state or consumers.

Verification:

- `npm test`: 2/2 passed.
- `git diff --check`: passed.
- Only the two consumer files changed.