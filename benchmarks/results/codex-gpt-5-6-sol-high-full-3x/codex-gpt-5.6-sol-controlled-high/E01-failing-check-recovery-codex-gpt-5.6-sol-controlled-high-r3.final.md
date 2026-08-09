Fixed `parsePair` in [`src/parser.mjs`](C:/Users/ptd26/AppData/Local/Temp/aic-agent-benchmark-nolJ5C/workspace%20with%20spaces/src/parser.mjs) to split only on the first `=`, preserving additional equals signs in values.

- Diagnosed `npm run check:legacy` as stale: the script is missing from `package.json`.
- Ran the authoritative `npm test`: all 2 tests pass.
- `git diff --check` reports no whitespace errors.