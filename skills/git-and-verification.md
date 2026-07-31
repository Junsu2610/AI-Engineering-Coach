---
name: git-and-verification
description: Repo branch, Conventional Commits, PR, and verification command matrix.
when_to_use: Creating branches, committing, opening PRs, or choosing which checks to run
  before handoff in this repository.
---

# Git and Verification

## Branch and commits

- Branch from `main`: `feat/<scope>`, `fix/<scope>`, `docs/<scope>`, `chore/<scope>`.
- Conventional Commits prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
- Reference the issue in the commit body or PR description when applicable (`Resolves #123`).
- See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for CLA and review process.
- Do not skip hooks (`--no-verify`) or push with a failing `npm run check`.

## Verification matrix

| Task | Command |
|---|---|
| Install | `npm ci` |
| Bundle | `npm run build` |
| Type-check | `npm run typecheck` |
| Lint | `npm run lint` |
| Spellcheck | `npm run spellcheck` |
| Unit tests | `npm test` (or `npx vitest run <file>`) |
| CI gate | `npm run check` |
| Webview e2e | `npm run test:e2e` |
| VSIX | `npm run package` (see [`package-extension`](package-extension.md)) |
| Bundle size | `npm run check-size` |

Default: run `npm run check` for code changes. Docs-only edits may use targeted
`rg` / `git diff --check` / `npm run spellcheck` when no TypeScript behavior changed.
Run `npm run test:e2e` when the webview was touched.

Known lint warning debt (incremental cleanup tracked separately): [`docs/plans/lint-warning-debt.md`](../docs/plans/lint-warning-debt.md).

## Workflow authority

- Repo docs are canonical execution authority.
- `teamagent/TASKS.md` is execution truth when team-agent work exists.
- `PROJECT_GOAL.md` is the roadmap/progress mirror.
- Notion is display-only and must not override repo or GitHub status.

## Anti-patterns

- Inventing an alternate publish or check path instead of the matrix above.
- Force-pushing protected branches or skipping hooks to "save time".
- Expanding PR scope into unrelated dirty files.
