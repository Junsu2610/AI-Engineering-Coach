[2026-08-11 19:14:59] Fixed the off-by-one error in [src/date-window.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-iiXqsx\workspace with spaces\src\date-window.mjs:2>) by making the end boundary inclusive (`<=`).

Verification:

- Focused regression test: passed
- Full `npm test`: 2/2 passed
- Public API unchanged; no unrelated changes