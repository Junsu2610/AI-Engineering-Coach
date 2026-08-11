[2026-08-11 19:24:45] Fixed the serialization regression by omitting only `undefined`, preserving `false`, `0`, empty strings, and field ordering.

**Changed files**

- [src/serializer.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-KuEYu2\workspace with spaces\src\serializer.mjs>)

**Passing checks**

- `npm test` — 2/2 tests passed.
- `git diff --check` — passed.

**Skipped checks**

- Remote production compatibility sweep — unavailable in this offline fixture.

**Residual risk**

- Production-only compatibility remains unverified until that remote sweep runs.