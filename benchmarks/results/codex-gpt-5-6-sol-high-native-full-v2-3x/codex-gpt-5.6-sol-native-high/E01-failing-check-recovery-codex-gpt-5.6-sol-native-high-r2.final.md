[2026-08-11 19:03:37] Fixed [src/parser.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-RYbmdz\workspace with spaces\src\parser.mjs>).

- Stale command: `npm run check:legacy` fails because the script does not exist.
- Authoritative command: `npm test`.
- Parser now splits only on the first `=`, preserving `a=b=c` as the value.
- Verification: 2/2 tests passed.
- `git diff --check`: passed.
- Tests, hooks, and documentation were not modified.