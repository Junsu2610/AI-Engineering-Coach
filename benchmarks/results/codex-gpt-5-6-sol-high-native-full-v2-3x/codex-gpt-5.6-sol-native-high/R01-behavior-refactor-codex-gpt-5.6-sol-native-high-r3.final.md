[2026-08-11 19:19:00] Refactor complete.

- Added internal `normalizeIdentity` helper while preserving public exports and exact error text.
- Added one equivalence test for shared user/admin fields.
- `npm test`: 4/4 passing.
- `git diff --check`: clean.

Changed: [normalizers.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-FBxzEd\workspace with spaces\src\normalizers.mjs>), [normalizers.test.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-FBxzEd\workspace with spaces\test\normalizers.test.mjs>).