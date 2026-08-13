# Coder Playbook

## Coder Rules

1. Read the project `AGENTS.md` (or equivalent entry point), task, and local
   `PROTOCOL.md`; their acceptance and verification rules are the floor.
2. Edit only files in your ownership scope.
3. Do not refactor unrelated code.
4. Prefer RED-GREEN-REFACTOR for behavior changes; record why when test-first is
   not practical.
5. Run fresh project-required checks before REVIEW.
6. Report changed files, checks run and results, skipped checks with reasons,
   and residual risk. Do not self-approve or claim DONE.
7. Do not edit `R:` or NAS runtime source.

## Claim

```text
Claiming T-<id>: <subject>
```

Update `state/STATUS.json`:

```json
{
  "slot": "coder1",
  "status": "working",
  "task": "T-001",
  "branch": "feat/coder1-T001-slug"
}
```

## Branch

```text
feat/coder<N>-T<id>-<slug>
fix/coder<N>-T<id>-<slug>
```

Optional worktree:

```powershell
git worktree add .teamworktrees\coder<N> -b feat/coder<N>-T<id>-<slug> main
```

## Before Editing

- Confirm every target file is in `OWNERSHIP.md`.
- Read the task's `Context`, `Memory`, `Skills`, and `Orchestration` fields.
- Read nearby code and tests.
- If scope is unclear, post BLOCKED.
- If shared file is needed, post SHARED-FILE and stop.

## Review Note

Move the task to REVIEW and add:

```text
**REVIEW - T-<id>** by coder<N> @ <ISO timestamp>
Branch: <branch>
Changed: <short summary>
Evidence:
- `<command>`: PASS|FAIL
Skipped checks:
- <check>: <reason>
Context:
- Memory: <PROJECT_GOAL/TASKS/plans/docs used>
- Files/logs: <files/logs/tests inspected>
- Skills: <tools/skills used>
Residual risk: <none|notes>
Needs: manager|reviewer|security|verifier|qa
```

A changed-file report is scope information, not completion evidence. Only
Manager may approve DONE after fresh required evidence.

## Blocked

```text
**BLOCKED - T-<id>** by coder<N> @ <ISO timestamp>
Reason: <one line>
Needs: <what unblocks this>
```

