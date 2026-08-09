Fixed `parsePair` in `src/parser.mjs` so it splits only on the first `=` and preserves additional equals signs in the value.

Verification:

- `npm run check:legacy` is stale and fails because the script does not exist.
- `npm test` is the repository-authoritative check and passes all 2 tests.
- `git diff --check` reports no whitespace errors.