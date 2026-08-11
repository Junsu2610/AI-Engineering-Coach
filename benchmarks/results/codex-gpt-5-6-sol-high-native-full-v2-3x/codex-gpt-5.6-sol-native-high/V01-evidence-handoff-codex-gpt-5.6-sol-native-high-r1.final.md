[2026-08-11 18:46:45] Serialization regression fixed: falsey values are preserved while `undefined` is omitted, without changing field order or the exported API.

**Changed files**

- [src/serializer.mjs](<C:/Users/ptd26/AppData/Local/Temp/aic-agent-benchmark-kGk3uY/workspace with spaces/src/serializer.mjs:3>)

**Passing checks**

- `npm test` — 2/2 tests passed
- `git diff --check` — passed

**Skipped checks**

- Remote production compatibility sweep — unavailable in this offline fixture

**Residual risk**

- Production compatibility was not remotely verified.