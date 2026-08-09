Consolidated both normalization paths through the private `normalizeRecord` helper while preserving the public exports, email behavior, permissions sorting, and exact validation error in [src/normalizers.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-F0xvuB\workspace%20with%20spaces\src\normalizers.mjs:1).

Added focused equivalence coverage for shared fields and validation behavior in [test/normalizers.test.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-F0xvuB\workspace%20with%20spaces\test\normalizers.test.mjs:25).

`npm test` passes: 4 tests, 0 failures.