# AI Engineer Coach Agent Context

## Context

- Repo docs and GitHub Issues are execution truth.
- Notion is summary context only and never overrides repo docs or GitHub.
- Load path: [`AGENTS.md`](../../AGENTS.md) → matching skill in [`skills/`](../../skills/) → files in scope for the task.
- Hard boundaries (telemetry, read-only logs, workers) live in `AGENTS.md` — do not duplicate here.

## Spec

- State whether the task is docs-only, rules/metrics, extension host, worker, webview, or tests.
- Approved Codex plans are archive-only by default. Archive them in `docs/plans/` and do not create or update `teamagent/TASKS.md` unless the user explicitly asks for task-board changes.
- Keep the change narrow and list the exact target files.

## Review

- Keep the response concise and cite file context.
- For non-trivial work, include one verification command up front.
- Run `git diff --check`.
- Use the smallest relevant verification set for the touched area (see [`skills/git-and-verification.md`](../../skills/git-and-verification.md)).
