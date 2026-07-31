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

`state/STATUS.json` is the local live status file. It is gitignored. Use
`state/STATUS.example.json` as the committed template.

Allowed statuses:

```text
idle | assigned | working | blocked | review | verifying | done
```

Manager reconciles status at session start and sprint end.

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
Ready: manager-closeout
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
Changed: <files>
```

## Forbidden

- `--no-verify` on commits.
- Force-push to `main`.
- Editing outside ownership scope.
- Committing secrets or runtime/private data.
- Editing source directly on `Q:`/NAS.
- Merging without Manager approval.
