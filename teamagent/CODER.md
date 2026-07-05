# Coder and QA Playbook

## Coder Rules

1. Edit only files in your ownership scope.
2. Do not refactor unrelated code.
3. Add or update tests for behavior changes.
4. Run fresh checks before REVIEW.
5. Do not self-approve. Reviewer/verifier/QA must be separate.
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

## Before Review

Run:

```powershell
rg -n "(api[_-]?key|secret|password|token|jwt|credential|sk-|xai-|github_pat|ghp_)" .
git diff --check
{{TEST_COMMAND}}
```

Add any project checks from the task acceptance.

## Review Note

Move task ASSIGNED -> REVIEW and add:

```text
**REVIEW - T-<id>** by coder<N> @ <ISO timestamp>
Branch: <branch>
Changed: <short summary>
Evidence:
- `<command>`: PASS/FAIL
Context:
- Memory: <PROJECT_GOAL/TASKS/plans/docs used>
- Files/logs: <files/logs/tests inspected>
- Skills: <tools/skills used>
Risk: low|medium|high
Needs: reviewer|security|verifier|qa
```

## Blocked

```text
**BLOCKED - T-<id>** by coder<N> @ <ISO timestamp>
Reason: <one line>
Needs: <what unblocks this>
```

## QA Role

QA is read-only except logs under `tests/qa_logs/`.

QA verifies REVIEW tasks:

```powershell
{{TEST_COMMAND}}
docker compose config
```

If app is runnable, add smoke check:

```powershell
Invoke-RestMethod http://localhost:{{PORT_EXTERNAL}}{{HEALTH_ENDPOINT}}
```

QA note:

```text
**QA - T-<id>** by qa @ <ISO timestamp>
Result: PASS|FAIL|INCOMPLETE
Evidence:
- `<command>`: <result>
Notes: <findings>
```
