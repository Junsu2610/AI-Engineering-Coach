# AI Engineer Coach Agent Instructions

- Repo truth: repository docs and GitHub Issues are the execution and task source of truth. Read `AGENTS.md`, relevant docs, and the exact files in scope before editing.
- Notion is dashboard, research, summary, and link context only. It does not override repo or GitHub truth.
- Accepted plans are archive-only by default. Archive approved Codex plans in `docs/plans/`. Do not create GitHub or Notion tasks, and do not create or update `teamagent/TASKS.md` unless the user explicitly asks for task-board changes.
- Keep replies concise. Use file context, name the exact target files, and for non-trivial work include one verification command.
- Privacy rules stay strict: zero telemetry, no remote logging, no core-analysis network calls, and user session logs remain read-only.
- Keep heavy parsing, warm-up, and cache writes in the existing workers under `src/core/*-worker.ts`.
- Default verification: `npm run check` for code changes; for docs-only work use targeted `rg` plus `git diff --check`.
- Preserve unrelated dirty changes and never edit generated output such as `dist/`, `docs/public/`, `*.vsix`, `node_modules/`, `test-results/`, or `.vscode-test/`.
