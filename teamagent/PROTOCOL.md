# Protocol - Git, Status, Communication

## Branch Model

```text
feat/coder<N>-T<id>-<slug>
fix/coder<N>-T<id>-<slug>
docs/manager-T<id>-<slug>
qa/T<id>-<slug>
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

## Secret Scan

Mandatory before staging:

```powershell
rg -n "(api[_-]?key|secret|password|token|jwt|credential|sk-|xai-|github_pat|ghp_)" .
```

Environment variable references are OK. Hardcoded values are not.

## Evidence Rules

Completion claims require fresh command output.

Verification tiers:

| Tier | Required evidence |
|---|---|
| quick | targeted test or smoke check |
| standard | tests + lint/type/build if available |
| strict | standard + reviewer + verifier + security if sensitive |

No DONE state if evidence is missing unless Manager records why verification is impossible.

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
Evidence: <commands/results>
Needs: reviewer|security|verifier|qa
```

Context handoff:

```text
**CONTEXT - T-<id>** by <slot> @ <ISO timestamp>
Memory: <PROJECT_GOAL/TASKS/plans/docs used>
Context: <files/logs/tests inspected>
Skills: <tools/skills/subagents used>
Next: <what Manager/QA should inspect next>
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
- Editing source directly on `Q:`/NAS.
- Self-approval by the author.
- Merging without Manager approval.
