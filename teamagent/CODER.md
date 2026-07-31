# Coder Playbook

## Coder Rules

1. Edit only files in your ownership scope.
2. Do not refactor unrelated code.
3. Make the requested scoped file changes.
4. Report changed files and a short implementation note.
6. Do not edit `Q:` or NAS runtime source.

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

## Completion Note

Keep the task in ASSIGNED and add:

```text
**COMPLETE - T-<id>** by coder<N> @ <ISO timestamp>
Branch: <branch>
Changed: <short summary>
Context:
- Memory: <PROJECT_GOAL/TASKS/plans/docs used>
- Files/logs: <files/logs/tests inspected>
- Skills: <tools/skills used>
Ready: manager-closeout
```

## Blocked

```text
**BLOCKED - T-<id>** by coder<N> @ <ISO timestamp>
Reason: <one line>
Needs: <what unblocks this>
```

