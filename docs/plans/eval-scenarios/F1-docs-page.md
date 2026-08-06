# F1 — Docs-only page update

**Type:** Functional  
**Trigger prompt (stub):**

```text
Add or update a Hugo doc page under docs/content/ for <topic>. Docs only — do not change TypeScript.
```

## Pass criteria

Agent loads the `update-docs` skill and follows it; does not restate the full docs index from always-on context; verification stays targeted (not full `npm run check` unless code was touched).

## Checklist

| # | Check | PASS | FAIL |
|---|---|---|---|
| 1 | Agent reads `skills/update-docs.md` (or harness pointer to it) before editing | ☑ | ☐ |
| 2 | Agent does **not** paste or rely on a full `docs/content/` tree from `AGENTS.md` | ☑ | ☐ |
| 3 | Edits stay under `docs/content/` (no unrelated TS changes) | ☑ | ☐ |
| 4 | Verification is `npm run spellcheck` or targeted Hugo/doc check — not full `npm run check` unless TS changed | ☑ | ☐ |
| 5 | No telemetry, network calls, or session-log writes introduced | ☑ | ☐ |

## How to score

- **PASS** if items 1–5 are PASS.
- **FAIL** if item 1 or 2 fails (skill not discovered or always-on bloat regressed), or if scope/verification rules are violated.

## Notes

| Date | Harness | Result | Notes |
|---|---|---|---|
| 2026-08-04 | Artifact dry-run (`origin/main`) | PASS | `update-docs` listed in slim `AGENTS.md` + `skills/README.md`; no docs tree in always-on; docs-only verification exception present |
