# Agent Readiness Roadmap

## Goal

Keep AI Engineering Coach startup context stable without bloating sessions: privacy-first, worker-based analysis, markdown-authored rules, and explicit verification.

## Existing Assets

- `.github/copilot-instructions.md`
- `docs/agent-prompts/checkpoint-workflow.md`
- `docs/agent-prompts/context-first-codex-workflow.md`
- `docs/agent-prompts/review-checklist.md`
- `docs/agent-prompts/spec-first-workflow.md`
- `docs/agent-prompts/task-template.md`
- `docs/agent-prompts/weekly-coach-review.md`
- `AGENTS.md`

## Verification Expectations

- Keep heavy analysis work off the extension host thread.
- Preserve zero-telemetry and read-only session-log rules.
- Run `npm run check` for code changes and narrower checks only when the task is docs-only.

## Next Updates

1. Refresh the startup instructions when worker boundaries, rule trust flow, or packaging checks materially change.
2. Add a short prompt for rule-authoring review only if the existing authoring docs stop being enough.
