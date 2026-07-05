# AI Engineer Coach Agent Context

## Context

- Repo docs and GitHub Issues are execution truth. Read `AGENTS.md` -> relevant docs -> files in scope.
- Notion is summary context only and never overrides repo docs or GitHub.
- Keep analysis correct, the extension host responsive, and user session logs read-only.

## Spec

- State whether the task is docs-only, rules/metrics, extension host, worker, webview, or tests.
- Approved Codex plans are archive-only by default. Archive them in `docs/plans/` and do not create or update `teamagent/TASKS.md` unless the user explicitly asks for task-board changes.
- Keep the change narrow and list the exact target files.

## Review

- Keep the response concise and cite file context.
- For non-trivial work, include one verification command up front.
- Run `git diff --check`.
- Use the smallest relevant verification set for the touched area.
