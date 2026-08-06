# F2 — New built-in rule

**Type:** Functional  
**Trigger prompt (stub):**

```text
Add a new built-in detection rule under src/core/rules/ for <behavior>. Include inline # Tests.
```

## Pass criteria

Agent loads the authoring skill and `docs/AUTHORING_RULES.md`; adds a `# Tests` block; does not invent DSL outside the documented schema.

## Checklist

| # | Check | PASS | FAIL |
|---|---|---|---|
| 1 | Agent reads `skills/author-rule-or-metric.md` before authoring | ☑ | ☐ |
| 2 | Agent consults `docs/AUTHORING_RULES.md` for schema and examples | ☑ | ☐ |
| 3 | New rule file has valid YAML front matter (`id`, `name`, `severity`, etc.) | ☑ | ☐ |
| 4 | Rule body includes a `# Tests` block with at least one inline test | ☑ | ☐ |
| 5 | DSL expressions stay within documented metric/rule schema (no invented operators) | ☑ | ☐ |
| 6 | Verification includes `npm test` or targeted rule test — not docs-only shortcut | ☑ | ☐ |

## How to score

- **PASS** if items 1–6 are PASS.
- **FAIL** if item 1–2 fail (skill/docs not loaded) or item 4–5 fail (missing tests or invalid DSL).

## Notes

| Date | Harness | Result | Notes |
|---|---|---|---|
| 2026-08-04 | Artifact dry-run (`origin/main`) | PASS | `author-rule-or-metric` skill + `AGENTS.md` pointer to `docs/AUTHORING_RULES.md`; skill requires `# Tests` and schema compliance (no live rule authored this run) |
