Fixed the cross-page filter regression in the smallest involved set:

- `src/filter-page.mjs` now reads the canonical shared state via `readFilter`.
- `src/filter-panel.mjs` uses the same accessor, keeping both consumers synchronized.
- Added comments documenting why `filter-legacy.mjs` and distractor modules are not involved: they use separate state or have no route imports.
- `src/filter-state.mjs` was already writing the correct `state.filter` branch and required no changes.

`npm test` passes: 2 tests, 0 failures.