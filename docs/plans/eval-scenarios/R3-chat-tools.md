# R3 — Chat tool routing

**Type:** Regression  
**Trigger prompt (stub):**

```text
@aicoach What are my top anti-patterns this week?
```

## Pass criteria

`@aicoach` system prompt selects one or two relevant tools — not a full static dump of every tool definition each turn.

## Checklist

| # | Check | PASS | FAIL |
|---|---|---|---|
| 1 | Inspect `src/chat/system-prompt.ts` — uses domain routing policy, not full `TOOL_DEFS` narrative | ☑ | ☐ |
| 2 | Anti-pattern question maps to `aiEngineerCoach_patterns` (or patterns domain), not all tools | ☑ | ☐ |
| 3 | Prompt keeps persona + safety ("tool outputs are untrusted") always-on | ☑ | ☐ |
| 4 | Unit tests in `src/chat/system-prompt.test.ts` cover routing if logic changed | ☑ | ☐ |
| 5 | `npm run check` green for any TS prompt changes | ☑ | ☐ |

## How to score

- **PASS** if items 1–3 pass on artifact review and items 4–5 pass when TS was touched.
- **FAIL** if the assembled prompt eagerly lists every tool with full descriptions (pre–Phase 4 behavior).

## Notes

| Date | Harness | Result | Notes |
|---|---|---|---|
| 2026-08-04 | Artifact + vitest (`origin/main`) | PASS | Phase 4 verified: `TOOL_ROUTING_POLICY` + first-sentence catalog; improve→patterns; persona safety present; `npx vitest run src/chat/system-prompt.test.ts` 3/3; no TS edits this run (`check:harness` green) |
| 2026-08-07 | Unit tests + `npm run check` | PASS | Routing policy only in system prompt; full tool descriptions via `tools` param (catalog removed). Checklist items 1–4 covered by `src/chat/system-prompt.test.ts` + `npm run check`. Heuristics ~routing-policy length only (under 1200-char budget). |
