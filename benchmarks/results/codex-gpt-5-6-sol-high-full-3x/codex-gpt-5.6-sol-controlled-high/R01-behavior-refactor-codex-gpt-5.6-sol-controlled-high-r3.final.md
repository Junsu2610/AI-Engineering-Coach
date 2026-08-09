Consolidated shared name/email normalization into the internal `normalizeIdentity` helper while preserving user lowercasing, admin email casing, permissions sorting, exports, and exact error text in [src/normalizers.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-79iPjx\workspace with spaces\src\normalizers.mjs>).

Added an equivalence test covering shared trimming and null-email handling in [test/normalizers.test.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-79iPjx\workspace with spaces\test\normalizers.test.mjs>).

`npm test` passes: 4 tests, 0 failures.