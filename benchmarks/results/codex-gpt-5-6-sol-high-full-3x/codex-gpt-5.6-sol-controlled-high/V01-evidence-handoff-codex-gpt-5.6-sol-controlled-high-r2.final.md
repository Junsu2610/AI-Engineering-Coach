Fixed the serializer to retain `false`, `0`, `''`, and `null` while omitting `undefined`, preserving field order.

**Changed Files**

- [src/serializer.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-zQdT4l\workspace with spaces\src\serializer.mjs) — corrected filtering.
- [test/serializer.test.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-zQdT4l\workspace with spaces\test\serializer.test.mjs) — added `null` coverage.

**Passing Checks**

- `npm test` — 2 tests passed.
- `git diff --check` — passed.

**Skipped Checks**

- Remote production compatibility sweep — unavailable in this offline fixture.

**Residual Risk**

- Production compatibility remains unverified until the remote sweep runs.