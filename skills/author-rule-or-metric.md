---
name: author-rule-or-metric
description: Author or edit a detection rule or metric (markdown + YAML front matter + DSL).
when_to_use: User asks to add/edit a built-in, personal, or project rule or metric; change
  severity/DSL; or update inline "# Tests" for rule behavior.
---

# Author a Rule or Metric

Rules and metrics are markdown with YAML front matter and a small DSL. Prefer editing
these files over changing TypeScript analyzer code.

## Paths

| Layer | Rules | Metrics |
|---|---|---|
| Built-in | [`src/core/rules/<id>.md`](../src/core/rules/) | [`src/core/metrics/<id>.metric.md`](../src/core/metrics/) |
| Guide | [`docs/AUTHORING_RULES.md`](../docs/AUTHORING_RULES.md) | same |
| Trust | [`src/core/rule-trust.ts`](../src/core/rule-trust.ts) | — |

Personal and project layers are loaded by [`src/core/rule-loader.ts`](../src/core/rule-loader.ts).
Trust flow is `pending -> review -> approve -> reload`; edits revoke trust.

## Steps

1. Read [`docs/AUTHORING_RULES.md`](../docs/AUTHORING_RULES.md) and one similar existing rule/metric.
2. Create or edit the markdown file. Keep `id`, `name`, `severity` (and metric metadata) accurate.
3. Add or update an inline `# Tests` block whenever detection behavior changes — these run in `npm test`.
4. Do not invent DSL operators outside the schema documented in the authoring guide.
5. Do not change the rule-trust flow or DSL surface without an explicit ask-first approval.

## Anti-patterns

- Hard-coding detection in TypeScript when a rule/metric file would suffice.
- Shipping a rule without `# Tests`.
- Duplicating the full authoring guide into chat instead of loading this skill + the guide.
