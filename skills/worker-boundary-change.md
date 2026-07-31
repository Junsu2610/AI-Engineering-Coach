---
name: worker-boundary-change
description: Keep heavy parse/warm-up/cache work off the extension host thread.
when_to_use: Touching session parsing, warm-up analysis, cache persistence, or anything that
  could block the VS Code extension host; adding work near parser or analyzer entry points.
---

# Worker Boundary Changes

Heavy lifting must stay off the extension-host thread.

## Workers

| Worker | Input | Output |
|---|---|---|
| [`src/core/parse-worker.ts`](../src/core/parse-worker.ts) | `logsDirs` | `progress` + `result` or `error` |
| [`src/core/warm-up-worker.ts`](../src/core/warm-up-worker.ts) | `sessions` | `antiPatterns` + `configHealth` |
| [`src/core/cache-write-worker.ts`](../src/core/cache-write-worker.ts) | cache payload | persisted cache |

Coordinator entry points live under [`src/core/analyzer.ts`](../src/core/analyzer.ts) and
[`src/core/parser.ts`](../src/core/parser.ts). Prefer extending these workers rather than
adding synchronous disk or analysis work on the host.

## Steps

1. Confirm the change belongs in an existing worker path before editing.
2. Keep host-side code thin: schedule work, handle progress, surface errors.
3. Never add sync parse/analysis on the extension host as a shortcut.
4. Preserve read-only session-log behavior and zero-telemetry rules.
5. For code changes, run `npm run check` (and focused vitest for the touched module).

## Anti-patterns

- `require("./parser").parseSync(...)` (or equivalent) on the extension host.
- New ad-hoc worker frameworks when the three existing workers already cover the path.
- Swallowing worker errors into empty/null results without surfacing failure.
