[2026-08-11 18:45:25] Fixed the gateway port mismatch in [shared-config.mjs](<C:\Users\ptd26\AppData\Local\Temp\aic-agent-benchmark-7EZ1SP\workspace with spaces\source\shared-config.mjs:5>).

- Default port changed from `9000` to `20128`.
- Public API and override behavior remain unchanged.
- Focused test: 3/3 passed.
- `npm test`: 3/3 passed using in-process isolation because sandbox spawning returned `EPERM`.
- `git diff --check`: passed.
- `runtime-mirror/**`: untouched.