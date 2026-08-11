[2026-08-11 19:23:30] Fixed the gateway mismatch in [source/shared-config.mjs](<C:/Users/ptd26/AppData/Local/Temp/aic-agent-benchmark-EEbMsf/workspace with spaces/source/shared-config.mjs:5>).

- Default port changed from `9000` to `20128`.
- Public exports and override behavior remain unchanged.
- Focused `npm test`: **3/3 passed** using in-process isolation because the sandbox blocks child-process spawning.
- `runtime-mirror/**` was not modified.
- `git diff --check` passed.