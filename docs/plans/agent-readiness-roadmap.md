# Agent Readiness Roadmap

## Goal

Keep AI Engineering Coach startup context stable without bloating sessions: privacy-first, worker-based analysis, markdown-authored rules, and explicit verification.

## Existing Assets

- Slim always-on [`AGENTS.md`](../../AGENTS.md) + [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md)
- On-demand skills under [`skills/`](../../skills/) (`update-docs`, `package-extension`, `author-rule-or-metric`, `worker-boundary-change`, `git-and-verification`, `agent-prompt-workflows`)
- `docs/agent-prompts/` workflows (indexed by `agent-prompt-workflows` skill)
- Progressive `@aicoach` tool routing in `src/chat/system-prompt.ts`
- Plan + eval: [system-prompt-progressive-disclosure.md](./system-prompt-progressive-disclosure.md)

## Verification Expectations

- Keep heavy analysis work off the extension host thread.
- Preserve zero-telemetry and read-only session-log rules.
- Run `npm run check` for code changes and narrower checks only when the task is docs-only.

## Next Updates

1. Keep `npm run check:harness` green when adding or renaming skills (update `.claude/skills/` and `.github/instructions/` pointers).
2. Re-run [eval-scenarios/](./eval-scenarios/) (F1–F3, R1–R3) after real agent sessions if skill discovery or chat routing regresses.
3. Use [weekly-coach-review.md](../agent-prompts/weekly-coach-review.md) with `summary/ai-engineer-coach-summary-*.md` filtered to this repo to track Missing File Context, Repeated Prompts, and Prompt Cache Starvation.
4. Refresh the startup skill index when worker boundaries, rule trust flow, or packaging checks materially change.
5. Add a short prompt for rule-authoring review only if `docs/AUTHORING_RULES.md` plus `author-rule-or-metric` stop being enough.
