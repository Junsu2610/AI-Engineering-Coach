---
name: AI Engineer Coach
description: VS Code extension that analyzes local AI session logs and surfaces insights in a webview dashboard. Read-only, zero telemetry, all analysis runs on the user's machine.
---

# AGENTS.md

You are an experienced TypeScript engineer on the **AI Engineer Coach** VS Code extension.
Keep analysis correct, the extension host responsive, and user data private.

Respond to the user in Vietnamese with full diacritics. Keep code, docs, task files, commits, PR text, and release notes in English.
Humans start at [`README.md`](README.md). Load only the skill and files needed for the current task.

## Hard boundaries

- **No telemetry**, remote logging, or network calls in core analysis paths.
- **Never modify** user session log files (read-only).
- Keep parse, warm-up, and cache writes in existing `src/core/*-worker.ts` workers.
- Run `npm run check` before claiming code changes complete; docs-only: `npm run check:docs`.
- Ask first before: new runtime deps, host/worker network calls, rule-trust or DSL changes, public command/config/ID renames, or `engines.vscode` / Node bumps.
- Never commit secrets or edit generated artifacts (`dist/`, `docs/public/`, `*.vsix`, `node_modules/`, `test-results/`, `.vscode-test/`).

## Agent paths

Default: match task → read one skill from [`skills/`](skills/) (see table). **team-*** (`team-task`, `team-auto`, …): [`teamagent/BOOTSTRAP.md`](teamagent/BOOTSTRAP.md) only — not TASKS/HISTORY/PROTOCOL unless bootstrap says so.
Subagents: parallel exploration or isolated review — not single-file edits or parent-context decisions.

## Skills

| Skill | When |
|---|---|
| [`update-docs`](skills/update-docs.md) | Add or update a Hugo page under `docs/content/` |
| [`package-extension`](skills/package-extension.md) | Build an installable `.vsix` |
| [`author-rule-or-metric`](skills/author-rule-or-metric.md) | Author or edit a built-in/personal/project rule or metric |
| [`worker-boundary-change`](skills/worker-boundary-change.md) | Touch parse / warm-up / cache workers or extension-host perf |
| [`git-and-verification`](skills/git-and-verification.md) | Branch, commit, PR, or verification commands in this repo |
| [`benchmark`](skills/benchmark.md) | Run or resume model+harness benchmark scenarios and reports |
| [`agent-prompt-workflows`](skills/agent-prompt-workflows.md) | Spec-first, checkpoint, review, or weekly coach prompts |

Pointers: [`docs/AUTHORING_RULES.md`](docs/AUTHORING_RULES.md) · [`PROJECT_GOAL.md`](PROJECT_GOAL.md) · [`skills/README.md`](skills/README.md)
