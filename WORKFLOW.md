# Workflow — AI Engineer Coach

Operating procedures for this VS Code extension repo. Agents and developers follow
these rules; deeper git/verification detail lives in [`skills/git-and-verification.md`](skills/git-and-verification.md).

## Scope

- **Local analysis only** — read-only session logs, zero telemetry, no network in core paths.
- **No NAS deploy** — this project is a desktop VS Code extension, not a Docker/NAS service.
  Do not reference `ops-remote-nas.md` or Synology deploy flows here.

## General rules

1. Check `git status` before any commit — never stage unintended files.
2. Preserve existing work — do not overwrite uncommitted changes without asking.
3. Scope edits to the current task — match existing style in touched files.
4. Never commit secrets, `.env`, runtime data, or generated artifacts (`dist/`, `*.vsix`, `node_modules/`).

## Local commands

| Action | Command |
|---|---|
| Install | `npm ci` |
| CI gate | `npm run check` (typecheck + lint + spellcheck + knip + lockfile lint + test) |
| Bundle | `npm run build` |
| Package VSIX | `npm run package` (see [`skills/package-extension.md`](skills/package-extension.md)) |
| Single test file | `npx vitest run <file>` |
| Webview e2e | `npm run test:e2e` (when webview changed) |

Docs-only changes may use targeted `npm run spellcheck` and `git diff --check` instead of full `check`.

## Branch and commits

**Single-agent work** (default): branch from `main` as `feat/<scope>`, `fix/<scope>`, `docs/<scope>`, `chore/<scope>` with Conventional Commits (`feat:`, `fix:`, `docs:`, …). Full matrix in [`skills/git-and-verification.md`](skills/git-and-verification.md).

**Team multi-coder work** (`team-*` invoked): use `feat/coder<N>-T<id>-<slug>` branches and task-scoped commit prefixes per [`teamagent/PROTOCOL.md`](teamagent/PROTOCOL.md).

## Authority

- Repo docs and GitHub are canonical; `PROJECT_GOAL.md` mirrors scope/progress.
- `teamagent/TASKS.md` is execution truth only when team-agent work is active.
- Notion is display-only and must not override repo or GitHub status.

## Team-agent path

Load [`teamagent/BOOTSTRAP.md`](teamagent/BOOTSTRAP.md) only when the user invokes `team-*` skills or commands — not on every session start.
