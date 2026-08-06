# AI Engineer Coach Agent Instructions

- Repo truth: repository docs and GitHub Issues are the execution and task source of truth. Read slim `AGENTS.md`, match the task to one skill in `skills/`, then open only files in scope.
- Notion is dashboard, research, summary, and link context only. It does not override repo or GitHub truth.
- Accepted plans archive in `docs/plans/`. Do not create tracker tasks from a plan unless the user asks.
- Non-trivial work: start from `docs/agent-prompts/task-template.md` or `docs/agent-prompts/context-first-codex-workflow.md` (do not copy bodies into chat).
- Keep replies concise. Name exact target files; for non-trivial work include one verification command.
- Privacy: zero telemetry, no remote logging, no core-analysis network calls, session logs stay read-only.
- Keep heavy parse / warm-up / cache writes in `src/core/*-worker.ts`.
- Default verification: `npm run check` for code; docs-only: `npm run check:docs`.
- Never edit generated output (`dist/`, `docs/public/`, `*.vsix`, `node_modules/`, `test-results/`, `.vscode-test/`).
