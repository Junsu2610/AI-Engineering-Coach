Refactored the duplicated validation/name/email normalization into the internal `normalizeRecord` helper in `src/normalizers.mjs`, while preserving exports, behavior, and the exact `Name is required.` error.

Added one equivalence test covering shared normalization with omitted email in `test/normalizers.test.mjs`.

`npm test` passes: 4 tests, 0 failures.