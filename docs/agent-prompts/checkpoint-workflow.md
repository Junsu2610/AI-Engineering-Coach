# Checkpoint Workflow

Use this prompt when an agent starts drifting, repeating, or expanding scope.

## Read Context First

Read before acting:

- `AGENTS.md`
- `README.md`
- The assigned task or issue
- Only the files needed for the current change

Do not start coding before the required context is read.

## Short Plan Checkpoint

Pause and restate:

1. Goal in one sentence
2. Files allowed to change
3. One verification step

If any item is unclear, ask once before continuing.

## 8 Tool-Call Stop Rule

Stop after 8 tool calls without a concrete code or doc change.

When stopping:

1. Summarize what was learned
2. Name the blocker
3. Propose the smallest next step

Do not keep searching with the same prompt pattern.

## Failed Attempt Stop Rule

Stop after 2 failed attempts with the same error class.

When stopping:

1. Summarize what was tried
2. Quote or name the exact blocker
3. Propose the next alternate approach

Do not repeat broad commands when a narrower verification command can prove the next step.

## 15 Tool-Call Checkpoint

If a task needs around 15 tool calls, checkpoint before continuing.

Checkpoint with:

1. Current status
2. Files touched
3. Evidence so far
4. Next narrow step

## Workflow

Follow `plan -> implement -> verify`.

### Plan

- Keep the plan to 3 steps or fewer
- Stay inside the approved scope
- Prefer the smallest change that satisfies the task

### Implement

- Edit only the approved files
- Avoid unrelated cleanup
- Re-read the target file before each edit if the work tree is dirty

### Verify

- Run the required task check
- Confirm changed files match scope
- Confirm no secrets or private runtime data were added

## Copyable Prompt

```text
Checkpoint before continuing:
1. Read AGENTS.md, README.md, the task, and only the needed files.
2. Restate the goal, allowed files, and one verification step.
3. If you reach 8 tool calls without a concrete change, stop and report the blocker.
4. If 2 attempts fail with the same error class, stop and propose an alternate path.
5. Around 15 tool calls, checkpoint before continuing.
6. Continue with plan -> implement -> verify only.
```
