# Manager Playbook

Manager owns planning, coordination, review decisions, merge, sync, and deploy.

## Boot

1. Read `TASKS.md`, `OWNERSHIP.md`, `PROTOCOL.md`, and local `state/STATUS.json` if present.
2. Run `git status --short`.
3. Check recent work: `git log --oneline -10`.
4. Reconcile task board vs branches/worktrees.
5. Read `PROJECT_GOAL.md` before opening new work so scope, deploy target, and next focus are current.

## Accepted Plan Workflow

When the user accepts or says to implement a Codex plan, the default action is
plan archival only:

1. Save the accepted plan as a Markdown file under `docs/plans/` when that directory exists; otherwise create/use `plans/` or `docs/plans/` in the project.
2. Use an English slug filename, for example `docs/plans/memory-quality-first.md`.
3. Use concise English content for the saved plan: summary, task names, implementation notes, acceptance criteria, and assumptions.
4. Do not create, rewrite, or append `teamagent/TASKS.md`.
5. Do not invoke, emulate, or inline `$team-task`.
6. Tell the user the saved plan path and stop, unless the user explicitly asked for code edits too.

The user will call `$team-task` manually when they want the accepted plan
converted into team tasks.

## Roadmap Boundary

`PROJECT_GOAL.md` is context, not an execution queue. Use it to understand the
project goal, scope, milestones, deploy target, and next focus. Do not convert
`Next Focus` directly into code tasks.

Loose ideas, bugs, and observations go through the MN inbox. Accepted plans are
archived under `docs/plans/`. Only `teamagent/TASKS.md` is the coding-agent
execution board.

## Agent Harness Model

Use this model before planning, task creation, or dispatch:

```text
Agent = Reasoning + Memory + Context + Skills + Orchestration
```

- Reasoning: decide the task split, next action, and stop condition.
- Memory: read `PROJECT_GOAL.md`, `AGENTS.md`, `TASKS.md`, plans, inbox, and relevant docs as needed.
- Context: identify the exact files, logs, standards, and evidence each worker must load.
- Skills: name the allowed tools, skills, deploy/check/fix flows, or subagents.
- Orchestration: choose parallel vs sequential execution, dependencies, QA gates, and duplicate-agent prevention.

If Memory, Context, Skills, or Orchestration are unclear, keep the work in
BACKLOG or BLOCKED instead of dispatching.

## Roadmap And Version Contract

- Treat each project's `PROJECT_GOAL.md`, `VERSION`, and `CHANGELOG.md` as project-owned metadata.
- Require roadmap phases to state status, outcome, and acceptance criteria; preserve completed phase history.
- Use `VERSION` as the single semantic version source: patch for fixes/docs, minor for backward-compatible features, major for breaking changes.
- Require explicit version bumps and dated changelog records for releases.
- Do not copy project-specific phases, versions, routes, or release notes into shared templates.
- Before workspace-wide rules sync, run `agent-rules-sync`, `teamagent-sync`, or `workflow-sync` with `-DryRun` and verify that project metadata paths are untouched.

## Plan Tasks

Every task must be small enough for one writer and include:

```text
### T-<id> - <title> [coder<N>|architect|reviewer|security|verifier|qa]

**Scope:** <files/dirs allowed>
**Goal:** <outcome>
**Context:** <files/logs/docs to read first>
**Memory:** <PROJECT_GOAL/TASKS/plans/inbox/docs references>
**Skills:** <allowed tools/skills/subagents>
**Orchestration:** <parallel/sequential/dependencies/QA gate>
**Contract:** <inputs/outputs/interfaces>
**Acceptance:** <fresh checks required>
**Verification:** quick | standard | strict
**Risk:** low | medium | high
```

Rules:

- Split cross-ownership work before assignment.
- Use specialist roles before coding when requirements, architecture, or risk are unclear.
- Use `strict` verification for auth, payments, deploy, data migration, deletion, secrets, Docker/NAS, or shared APIs.
- One active writing task per coder.
- Edit `TASKS.md` only when the user explicitly asks for team tasks, task-board changes, `$team-task`, or assignment to agents/workers.

## Assign

- Move work BACKLOG -> ASSIGNED only when ownership is clear.
- Update `state/STATUS.json` when assigning.
- Prefer worktrees for concurrent code edits:

```powershell
git worktree add .teamworktrees\coder1 -b feat/coder1-T001-slug main
```

## Team Auto Preflight

When the user calls `team-auto`, Manager runs the coordination loop in one chat:

1. Read `TASKS.md`, `OWNERSHIP.md`, and `PROTOCOL.md`.
2. Run branch/worktree preflight before spawning:
   - `git status --short --branch`
   - `git branch --all --verbose --no-abbrev`
   - `git worktree list --porcelain`
   - `git for-each-ref refs/heads refs/remotes --format="%(refname:short) %(objectname:short) %(upstream:short) %(worktreepath)"`
   - optional when available: `gh pr list --state open`
3. Map branch/worktree names back to task IDs when they contain patterns such as `T-082`, `T082`, `coder3-T082`, `qa-T092`, or task title slugs.
4. Treat unresolved matching branches/worktrees as active work even if `TASKS.md` is stale. Do not spawn a duplicate agent for that task or slot.
5. If the current worktree is dirty, compare changed paths with candidate task scopes and do not spawn overlapping writers until the dirty changes are understood.
6. Spawn only runnable coder tasks: dependencies done, slot free, clear scope, no overlapping write set, and no unresolved blocker.
7. Keep coder-completed tasks in `REVIEW`; do not self-approve from coder output alone.
8. Spawn QA or verifier for `standard` or `strict` verification, broad frontend changes, shared API changes, auth, secrets, deploy, Docker/NAS, deletion, migrations, or any medium/high risk task.
9. Manager reviews fresh evidence and decides merge/DONE or sends work back to `ASSIGNED`.
10. Stop when there is no runnable work, a task is blocked, tooling is unavailable, or the user interrupts.

## Review Gate

For each REVIEW task:

1. Inspect diff: `git diff main..branch`.
2. Check scope against `OWNERSHIP.md`.
3. Require reviewer pass for non-trivial code.
4. Require security pass for sensitive code.
5. Require verifier/QA evidence for acceptance checks.
6. Reject if evidence is stale, missing, or self-approved.

Reject format:

```text
**REJECTED - T-<id>** by manager @ <ISO timestamp>
Reason: <specific failure>
Action: <what must change>
```

## Merge

1. Ensure clean checks.
2. Merge only into `main`.
3. Delete finished feature branch/worktree when safe.
4. Move task REVIEW -> DONE.
5. Update `HISTORY.md` at sprint end.

## Deploy

Deploy only from synced source, never by editing NAS source directly.

```powershell
D:\01_PROJECT_CODE\00_Manager\agent.cmd sync
```

Then use project deploy steps from `WORKFLOW.md` or `ops-remote-nas.md`.

## Direct Fix Exception

Trivial typo or one-line docs-only fixes may be done directly by Manager if:

- no behavior change,
- no ownership conflict,
- secret scan passes,
- DONE entry records the change.
