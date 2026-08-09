Fixed the serialization regression by omitting only `undefined` values, preserving `false`, `0`, empty strings, and insertion order.

Changed files

- `src/serializer.mjs`

Passing checks

- `npm test` — 2 tests passed.
- `git diff --check` — passed.

Skipped checks

- Remote compatibility sweep — unavailable in this offline fixture.

Residual risk

- Remote/platform compatibility remains unverified.