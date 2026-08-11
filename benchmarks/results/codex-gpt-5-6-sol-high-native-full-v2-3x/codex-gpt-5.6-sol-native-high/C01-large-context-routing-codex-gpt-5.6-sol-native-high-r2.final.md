[2026-08-11 19:01:18] Fixed the cross-page filter regression with the smallest change set: two files.

- [filter-page.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-9ZpGVn\workspace with spaces\src\filter-page.mjs:1>)
- [filter-panel.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-9ZpGVn\workspace with spaces\src\filter-panel.mjs:1>)

Both consumers now use the existing canonical `readFilter()` accessor. The writer correctly stores `state.filter`; the consumers incorrectly read `state.filters`.

Other similarly named modules are uninvolved:

- `filter-legacy.mjs` reads the separate `legacyFilters` branch and is never imported by this flow.
- `src/distractors/filter-*.mjs` files have no references in the active import graph.
- No test or shared-state changes were necessary.

Verification:

- `npm test`: 2/2 passed.
- `git diff --check`: passed.
- Final diff: 2 files, 6 insertions, 2 deletions.