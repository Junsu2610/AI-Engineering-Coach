[2026-08-11 19:21:18] Fixed [src/parser.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-vuo1R8\workspace with spaces\src\parser.mjs>).

- Diagnosed stale command: `npm run check:legacy` references a missing script.
- Authoritative check: `npm test`.
- Parser now splits only at the first `=`, preserving `a=b=c`.
- Verification: 2/2 tests passed.
- `git diff --check`: clean.
- Tests, hooks, and documentation were unchanged.