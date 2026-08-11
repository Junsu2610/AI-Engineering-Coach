[2026-08-11 18:59:53] Refactor complete.

- Added internal `normalizeIdentity` helper for shared validation, name trimming, and email normalization.
- Preserved `normalizeUser` and `normalizeAdmin` exports, behavior, and exact error text.
- Added focused shared-equivalence coverage.
- `npm test`: 4/4 passed.
- Export check: `normalizeAdmin, normalizeUser`.
- `git diff --check`: clean.

Changed: [normalizers.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-dlHc43\workspace with spaces\src\normalizers.mjs>), [normalizers.test.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-dlHc43\workspace with spaces\test\normalizers.test.mjs>).