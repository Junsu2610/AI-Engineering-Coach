# Spec-First Workflow

Use this workflow for any non-trivial coding task before implementation starts.

## Required Mini Spec

Start with these fields:

- Goal: the exact outcome in one sentence.
- Acceptance criteria: observable results that define done.
- Constraints: privacy, no telemetry, worker boundaries, public API limits, protected files, or dirty working tree risks.
- Files likely involved: `2-5` repo files or directories to inspect first.
- Verification command: the narrowest command that proves the change.

If the request is vague, infer the smallest safe spec. Ask one concise clarifying question only when the wrong assumption could change behavior, public APIs, data privacy, or user data.

## Tiny Spec Template

```text
Goal: <one sentence>
Acceptance criteria:
- <observable result>
- <scope boundary>
Constraints:
- <privacy, worker, API, generated files, dirty working tree>
Files likely involved:
- <path>
- <path>
Verification command: <command>
```

## Implementation Rules

- Keep the first implementation slice small enough to review in one diff.
- Prefer focused verification over broad repeated commands.
- If 2 attempts fail with the same error class, stop and summarize what was tried, the exact blocker, and one alternate approach.
- If the task takes around 15 tool calls, checkpoint with current status, files touched, evidence so far, and the next narrow step.

## Completion Gate

Before declaring completion:

- Inspect `git diff` for scope creep.
- Report changed files.
- State whether the change is docs-only or behavior-changing.
- List tests or checks run.
- Name residual risk.

For generated code, also verify correctness, edge cases, and privacy/no-telemetry boundaries.

## Session Hygiene

- Keep one session focused on one task type: bug fix, feature, docs, deploy, or review.
- Start a new task/session when switching task type.
- Avoid mega sessions. When context grows, archive decisions and follow-up scope in `docs/plans/`.
