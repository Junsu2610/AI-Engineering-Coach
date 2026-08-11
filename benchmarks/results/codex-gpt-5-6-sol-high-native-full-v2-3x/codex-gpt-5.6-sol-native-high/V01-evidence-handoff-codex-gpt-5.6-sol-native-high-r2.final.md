[2026-08-11 19:06:27] Fixed the serialization regression by excluding only `undefined`, preserving `false`, `0`, empty strings, and field order.

Changed files

- [src/serializer.mjs](<C:/Users/ptd26/AppData/Local/Temp/aic-agent-benchmark-vjR5WS/workspace with spaces/src/serializer.mjs:3>)

Passing checks

- `npm test`: 2 passed, 0 failed
- `git diff --check`: passed

Skipped checks

- None.

Residual risk

- Low; coverage is limited to the supplied plain-record cases.