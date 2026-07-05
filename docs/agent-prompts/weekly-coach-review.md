# Weekly Coach Review

Use this workflow once per week to convert Coach findings into a small improvement plan.

## Weekly Export

Export the latest weekly Coach summary or open the current dashboard summary.

Capture only:

- Date range
- Top anti-patterns
- Flow or work-pattern notes
- A few key counts or scores

Do not paste private runtime data or raw session logs.

## Review Top 5 Anti-Patterns

Review the top 5 items by severity or frequency.

For each one, note:

1. Why it happened
2. Whether it is still active
3. The smallest workflow fix that could reduce it

Prioritize repeated prompts, missing context, review gaps, and runaway loop signals first.

## Choose 1-2 Improvements

Pick only 1 or 2 changes for the next week.

Good examples:

- Add or tighten persistent instructions
- Use a checkpoint prompt before large edits
- Require a review checklist before merge
- Split large requests into smaller scoped prompts

Do not start more changes than the team can keep consistent.

## Metrics To Track

Track a short weekly set:

- Count of top 5 anti-patterns
- Repeated prompts
- Low-context or missing-file-context findings
- Slow responses
- Weekend or late-night coding signals
- One output metric such as sessions, requests, or AI LoC

## Copyable Prompt

```text
Run a weekly Coach review. Use the latest weekly export, inspect the top 5 anti-patterns, choose only 1-2 improvements for next week, and report the metrics to track without including private runtime data.
```
