# Weekly Coach Review

Use this workflow once per week to convert Coach findings into a small improvement plan for **this repository** (`AI Engineering Coach`).

## Weekly Export

Open the latest exported summary:

- Path pattern: `summary/ai-engineer-coach-summary-*.md` (or matching `.json` in the same folder)
- Pick the file with the most recent date suffix (for example `summary/ai-engineer-coach-summary-2026-07-26.md`)

**Filter to this repo workspace** before reviewing anti-patterns:

- In the dashboard: filter workspace to `AI Engineering Coach` (or the local path `D:\01_PROJECT_CODE\AI Engineering Coach` / clone root).
- In the summary JSON: use workspace-scoped counts when available; ignore unrelated workspaces.

Capture only:

- Date range
- Top anti-patterns **for this repo**
- Flow or work-pattern notes
- A few key counts or scores

Do not paste private runtime data or raw session logs.

## Priority Anti-Patterns (this repo)

Track these three signals weekly — they map directly to harness adoption work:

| Anti-pattern | What to look for | Smallest fix |
|---|---|---|
| **Missing File Context** | Prompts without `#file` / open-editor context | Use [context-first-codex-workflow.md](./context-first-codex-workflow.md); add `skills/<id>.md` to Read first |
| **Repeated Prompts** | Near-duplicate retries with the same wording | Change scope or add one missing file reference — do not resend the same prompt |
| **Prompt Cache Starvation** | Unstable prompt prefix, pasted blobs, mid-task chat clears | Keep AGENTS + skill pointers stable; prefer file refs over pasted code |

Also review the top 5 by severity or frequency within the filtered workspace.

For each priority item, note:

1. Why it happened
2. Whether it is still active
3. The smallest workflow fix that could reduce it

## Choose 1-2 Improvements

Pick only 1 or 2 changes for the next week.

Good examples:

- Add or tighten persistent instructions (`AGENTS.md` / Copilot stub — stay within line budget)
- Load matching `skills/<id>.md` before implementation tasks
- Use a checkpoint prompt before large edits
- Require a review checklist before merge
- Split large requests into smaller scoped prompts

Do not start more changes than the team can keep consistent.

## Metrics To Track

Track a short weekly set **for this repo workspace**:

- Count of top 5 anti-patterns (filtered)
- **Missing File Context** occurrence trend
- **Repeated Prompts** occurrence trend
- **Prompt Cache Starvation** occurrence trend
- Slow responses (optional)
- Weekend or late-night coding signals (optional)
- One output metric such as sessions, requests, or AI LoC

Compare week-over-week using successive `summary/ai-engineer-coach-summary-*.md` exports.

## Copyable Prompt

```text
Run a weekly Coach review for the AI Engineering Coach repo workspace. Open the latest summary/ai-engineer-coach-summary-*.md (filter to this repo), inspect the top 5 anti-patterns, prioritize Missing File Context / Repeated Prompts / Prompt Cache Starvation, choose only 1-2 improvements for next week, and report the metrics to track without including private runtime data.
```
