# Protocol - Git, Status, Communication

## Branch Model

```text
feat/coder<N>-T<id>-<slug>
fix/coder<N>-T<id>-<slug>
docs/manager-T<id>-<slug>
```

## Commit Format

```text
<type>(<slot>): T-<id> <description>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `sec`.

## Status State

`state/STATUS.json` is the legacy live worker-status file. Repositories may
still track it despite local-only intent, so never store goal text, credentials,
private data, or blocker details there. Use `state/STATUS.example.json` as the
worker-status template.

For `team-goal`, resolve
`git rev-parse --path-format=absolute --git-common-dir` and persist the active
Goal Mode checkpoint only at
`<absolute common-dir>/team-goal/<scope_fingerprint>.json`. Do not use
`git rev-parse --git-path`; linked worktrees resolve it to different state:

```text
canonical_repo_id, goal_id, goal_status, scope_fingerprint, outcome, mode,
execution_depth,
phase, plan_path,
blocker_fingerprint, blocker_count, updated_at
```

This Git-private checkpoint is recovery state, not a task board. Never copy it
into tracked files, promote unapproved work, or overwrite `teamagent/TASKS.md`
task truth. Store only a sanitized execution-safe outcome and never credentials,
secrets, or raw private values.

## Verification Rigor

- `quick`: aggregate declared acceptance into exactly one targeted pass after
  the logical change batch and inspect the scoped diff in that pass.
- `standard`: run `quick` plus at most one narrow regression test, static check,
  build target, or behavioral check covering the changed surface.
- `strict`: run `standard` plus relevant repo-required integration, smoke,
  security, migration, deploy, or broader regression gates for high-risk or
  release-critical work.

Reuse passing evidence while relevant files, inputs, command, and environment
remain unchanged. Do not repeat full suites, Git status, hashes, YAML parsing,
template checks, or broad scans for ceremony.

The level changes evidence rigor, not scope or authority. Record missing
applicable checks explicitly. Never perform external, destructive, credentialed,
deploy, or Git mutations without separate authorization.

Execution depth is process overhead, not verification rigor:

- `fast`: default starting path for every request; one cheap scoped inspection,
  direct Manager work, targeted acceptance, no task board/subagent/review.
- `standard`: promote only on concrete coupled complexity, moderate risk, or
  broader regression/build needs; file count alone is not a trigger.
- `strict`: full task/subagent/specialist and broader relevant gates.

Promote before another write when scope, overlap, risk, or evidence needs grow.

Subagent speed gate:

- Plan-only, answer-only, status-only, small diagnostics, `fast`, and
  single-writer work use zero subagents.
- Dispatch requires at least two independent scopes and positive expected time
  savings after spawn, wait, and reconciliation overhead.
- Nested delegation is disabled by default. Workers must receive an explicit
  no-delegation instruction.
- Use one bounded wait wave and stop waiting when local acceptance is ready.

Allowed statuses:

```text
idle | assigned | working | blocked | review | verifying | done
```

Manager reconciles status at session start and sprint end.

## Evidence Rules

The nearest project `AGENTS.md` (or equivalent entry point) and this protocol
set the completion floor. Completion requires fresh evidence against task
acceptance. Standard verification means tests plus available lint, type, and
build checks; docs/config work uses narrow relevant checks. Record skipped checks
with reasons and residual risk. Changed files or a scoped edit report alone are
not completion evidence, and coder self-report cannot approve DONE.

## Review Discipline

Non-trivial REVIEW tasks use two passes in this order:

1. Spec compliance: goal, contract, acceptance criteria, ownership, and
   user-visible behavior.
2. Code quality: correctness, maintainability, tests, edge cases, security,
   performance, and regression risk.

When reviewer or Manager requests changes, include one primary fail reason:

```text
scope|requirement|logic|test|build|security|evidence
```

Keep fresh evidence, skipped checks with reasons, and residual risk in the
review record.

## Worktree Mode

Use worktrees when two or more coders edit concurrently.

Create:

```powershell
git worktree add .teamworktrees\coder1 -b feat/coder1-T001-slug main
```

List:

```powershell
git worktree list
```

Remove only after merge and clean status:

```powershell
git worktree remove .teamworktrees\coder1
git branch -d feat/coder1-T001-slug
```

Never remove a dirty worktree. Preserve and report it.

## Communication Blocks

Blocked:

```text
**BLOCKED - T-<id>** by <slot> @ <ISO timestamp>
Reason: <one line>
Needs: <unblocker>
```

Shared file:

```text
**SHARED-FILE - T-<id>** <slot> needs <path> owned by <owner>
Lines: <approx range>
Reason: <why needed>
```

Review request:

```text
**REVIEW - T-<id>** by <slot> @ <ISO timestamp>
Branch: <branch>
Changed: <files>
Evidence: <commands/results>
Skipped checks: <checks/reasons>
Residual risk: <none|notes>
Needs: manager|reviewer|security|verifier|qa
```

Context handoff:

```text
**CONTEXT - T-<id>** by <slot> @ <ISO timestamp>
Memory: <PROJECT_GOAL/TASKS/plans/docs used>
Context: <files/logs/tests inspected>
Skills: <tools/skills/subagents used>
Next: <what Manager should inspect next>
```

Approval:

```text
**APPROVED - T-<id>** by <role> @ <ISO timestamp>
Evidence: <commands/results>
Residual risk: <none|notes>
```

## Forbidden

- `--no-verify` on commits.
- Force-push to `main`.
- Editing outside ownership scope.
- Committing secrets or runtime/private data.
- Editing source directly on `R:`/NAS.
- Merging without Manager approval.
