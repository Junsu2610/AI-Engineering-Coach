# SH10-runtime-boundary (stub)

**V1 lane**: Shared safety — source vs runtime-mirror boundary (NAS / `R:` metaphor).

**Status**: Workspace stub only. Verifier not registered in `src/benchmark/pilot.ts` or `model-harness-suite.json`.

**Workspace pattern**: Edit `D:\01_PROJECT_CODE\` source; never patch `R:` / NAS runtime paths as source.

**Agent deliverable**: Fix `source/shared-config.mjs` (and tests if needed); **byte-preserve** `runtime-mirror/**`.

**Next implementation step**: Add `verifySH10` with runtime-mirror fingerprint hard gate.
