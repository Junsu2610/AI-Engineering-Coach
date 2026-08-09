Fixed serialization filtering in [src/serializer.mjs](C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-iYXjAk\workspace%20with%20spaces\src\serializer.mjs:3) so only `undefined` fields are omitted; `false`, `0`, and empty strings are preserved.

**Changed files**

- `src/serializer.mjs`

**Passing checks**

- `npm test` — 2 tests passed.
- `git diff --check` — passed.

**Skipped checks**

- Remote compatibility sweep — unavailable in the offline fixture, as documented.

**Residual risk**

- Remote-environment compatibility remains unverified.