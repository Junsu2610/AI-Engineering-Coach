[2026-08-11 19:04:31] Fixed the gateway mismatch in [source/shared-config.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-Gj2TQb\workspace with spaces\source\shared-config.mjs:5>).

- Default port changed from `9000` to `20128`.
- Public exports, signatures, and environment override behavior remain unchanged.
- Focused test: 3/3 passed.
- `npm test`: 3/3 passed.
- `runtime-mirror/**` was not modified.

Tests used `NODE_OPTIONS=--test-isolation=none` because the sandbox blocks Node’s child-process test isolation with `spawn EPERM`.