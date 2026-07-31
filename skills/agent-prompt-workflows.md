---
name: agent-prompt-workflows
description: Index of reusable agent prompt workflows under docs/agent-prompts/.
when_to_use: User asks for spec-first, context-first, checkpoint, review checklist, weekly
  coach review, task template, or repo-context prompt workflows.
---

# Agent Prompt Workflows

These prompts are **manual / on-demand** — they are not auto-loaded as always-on context.
Open only the file that matches the user's request.

| Prompt | Path | Use when |
|---|---|---|
| Spec-first | [`docs/agent-prompts/spec-first-workflow.md`](../docs/agent-prompts/spec-first-workflow.md) | Lock scope before coding |
| Context-first Codex | [`docs/agent-prompts/context-first-codex-workflow.md`](../docs/agent-prompts/context-first-codex-workflow.md) | Reduce missing-file / repeated-prompt waste |
| Checkpoint | [`docs/agent-prompts/checkpoint-workflow.md`](../docs/agent-prompts/checkpoint-workflow.md) | Mid-task status and next-step gates |
| Review checklist | [`docs/agent-prompts/review-checklist.md`](../docs/agent-prompts/review-checklist.md) | Pre-merge review pass |
| Weekly coach review | [`docs/agent-prompts/weekly-coach-review.md`](../docs/agent-prompts/weekly-coach-review.md) | Recurring coaching reflection |
| Task template | [`docs/agent-prompts/task-template.md`](../docs/agent-prompts/task-template.md) | Shape a scoped implementation task |
| Repo context | [`docs/agent-prompts/repo-context.md`](../docs/agent-prompts/repo-context.md) | Compact repo orientation for a new chat |

## Steps

1. Identify the workflow the user named (or the closest match in the table).
2. Read that single markdown file; do not paste every prompt into the reply.
3. Follow the file's steps; keep verification proportional to the change.

## Anti-patterns

- Dumping the entire `docs/agent-prompts/` tree into always-on context.
- Rewriting these prompts into a new parallel skill body instead of linking here.
