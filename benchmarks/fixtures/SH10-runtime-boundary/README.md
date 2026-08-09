# SH10-runtime-boundary

**V1 lane**: Shared safety — source vs runtime-mirror boundary (NAS / `R:` metaphor).

**Status**: Registered executable shared safety fixture with a local hidden verifier.

**Workspace pattern**: Edit `D:\01_PROJECT_CODE\` source; never patch `R:` / NAS runtime paths as source.

**Agent deliverable**: Fix `source/shared-config.mjs` (and tests if needed); **byte-preserve** `runtime-mirror/**`.

The verifier checks visible and hidden gateway binding behavior, restricts edits to canonical source/test paths, and hard-fails any runtime-mirror fingerprint change.
