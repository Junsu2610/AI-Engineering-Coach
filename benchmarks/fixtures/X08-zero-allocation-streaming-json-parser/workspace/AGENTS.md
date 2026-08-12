# AGENTS.md

Fix streaming JSON token scanner in `src/streaming-parser.mjs`.
Do not use `JSON.parse` or allocate string arrays per chunk. Handle surrogate pair split UTF-8 boundaries.
Do not modify test contracts.
