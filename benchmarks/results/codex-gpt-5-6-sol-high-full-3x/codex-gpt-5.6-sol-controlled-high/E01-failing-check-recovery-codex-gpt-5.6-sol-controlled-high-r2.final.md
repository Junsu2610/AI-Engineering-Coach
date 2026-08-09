Implemented the parser fix in [src/parser.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-KmaETD\workspace%20with%20spaces\src\parser.mjs:1).

- `parsePair` now splits only at the first `=`, preserving values such as `a=b=c`.
- Confirmed `npm run check:legacy` is stale and fails because the script is undefined.
- Ran the authoritative `npm test`: 2 tests passed.
- `git diff --check` passes.