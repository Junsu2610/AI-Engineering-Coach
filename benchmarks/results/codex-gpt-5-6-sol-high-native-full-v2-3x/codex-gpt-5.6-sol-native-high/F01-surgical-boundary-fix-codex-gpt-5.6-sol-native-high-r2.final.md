[2026-08-11 18:55:30] Fixed the off-by-one error in [src/date-window.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-poXXQ9\workspace with spaces\src\date-window.mjs>): the inclusive end boundary now uses `<=`.

Verification:

- Focused regression test: passed
- `npm test`: 2/2 passed
- `git diff --check`: passed
- Public API unchanged; no unrelated changes