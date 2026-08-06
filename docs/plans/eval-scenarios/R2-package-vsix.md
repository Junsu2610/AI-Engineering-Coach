# R2 — Package VSIX regression

**Type:** Regression  
**Trigger prompt (stub):**

```text
Build an installable VSIX for local testing.
```

## Pass criteria

Agent follows `package-extension` skill steps; does not invent an alternate publish or packaging path.

## Checklist

| # | Check | PASS | FAIL |
|---|---|---|---|
| 1 | Agent reads `skills/package-extension.md` | ☑ | ☐ |
| 2 | Uses `npm run package` (after build/check as the skill specifies) | ☑ | ☐ |
| 3 | Does not invent custom vsce flags or marketplace publish steps | ☑ | ☐ |
| 4 | Does not commit `*.vsix` or edit `dist/` as source of truth | ☑ | ☐ |
| 5 | Output is a local `.vsix` artifact, not a new runtime dependency | ☑ | ☐ |

## How to score

- **PASS** if items 1–5 are PASS.
- **FAIL** if item 1–2 fail (skill bypassed) or packaging invents a new path.

## Notes

| Date | Harness | Result | Notes |
|---|---|---|---|
| 2026-08-04 | Artifact dry-run (`origin/main`) | PASS | `package-extension` retained in skills index + slim `AGENTS.md`; skill still owns `npm run package` path |
