# F3 — Parse / worker path

**Type:** Functional  
**Trigger prompt (stub):**

```text
Improve session log parsing performance. Touch only the parse pipeline and related workers.
```

## Pass criteria

Agent keeps heavy work in `parse-worker` and existing `src/core/*-worker.ts` files; does not add synchronous parse on the extension host.

## Checklist

| # | Check | PASS | FAIL |
|---|---|---|---|
| 1 | Agent reads `skills/worker-boundary-change.md` before editing | ☐ | ☐ |
| 2 | Parse work stays in `src/core/parse-worker.ts` or existing worker pattern | ☐ | ☐ |
| 3 | No new sync parse path on `src/extension.ts` or extension-host thread | ☐ | ☐ |
| 4 | Warm-up and cache writes remain in their existing worker files | ☐ | ☐ |
| 5 | Agent runs `npm run check` (or targeted tests) before claiming done | ☐ | ☐ |

## How to score

- **PASS** if items 1–5 are PASS.
- **FAIL** if item 2–4 fail (host-thread parse or worker boundary broken).

## Notes

| Date | Harness | Result | Notes |
|---|---|---|---|
| | | | |
