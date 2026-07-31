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

GitHub may hold complex brainstorming, roadmap, phase, or issue-planning
context, but execution still starts only from repo truth and explicit
`$team-task` or direct implementation requests.

## Roadmap Boundary

`PROJECT_GOAL.md` is context, not an execution queue. Use it to understand the
project goal, scope, milestones, deploy target, and next focus. Do not convert
`Next Focus` directly into code tasks.

Loose ideas, bugs, and observations go through the MN inbox. Accepted plans are
archived under `docs/plans/`. `PROJECT_GOAL.md` is the repo-local scope/progress
mirror. Only `teamagent/TASKS.md` is the coding-agent execution board. Notion
is display-only and GitHub is the optional planning/tracking layer for complex
work.

## Agent Harness Model

Use this model before planning, task creation, or dispatch:

```text
Agent = Reasoning + Memory + Context + Skills + Orchestration
```

- Reasoning: decide the task split, next action, and stop condition.
- Memory: read `PROJECT_GOAL.md`, `AGENTS.md`, `TASKS.md`, plans, inbox, and relevant docs as needed.
- Context: identify the exact files, logs, standards, and evidence each worker must load.
- Skills: name the allowed tools, skills, deploy/check/fix flows, or subagents.
- Orchestration: choose parallel vs sequential execution, dependencies, and duplicate-agent prevention.

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
### T-<id> - <title> [coder<N>|coder-mini|architect|reviewer|security|verifier]

**Scope:** <files/dirs allowed>
**Goal:** <outcome>
**Context:** <files/logs/docs to read first>
**Memory:** <PROJECT_GOAL/TASKS/plans/inbox/docs references>
**Skills:** <allowed tools/skills/subagents>
**Orchestration:** <parallel/sequential/dependencies/Manager closeout>
**Contract:** <inputs/outputs/interfaces>
**Model:** gpt-5.6-luna | gpt-5.6-terra | gpt-5.6-sol (optional)
**Reasoning Effort:** low | medium | high | xhigh (optional)
**Risk:** low | medium | high
```

Rules:

- Split cross-ownership work before assignment.
- Use specialist roles before coding when requirements, architecture, or risk are unclear.
- One active writing task per coder.
- Use `coder-mini` only for light, low-risk docs, tests, small config, simple single-file fixes, or isolated low-risk code changes.
- Do not use `coder-mini` for auth, secrets, deploy, Docker/NAS, migrations, deletion, shared APIs, broad frontend changes, or medium/high-risk tasks.
- Edit `TASKS.md` only when the user explicitly asks for team tasks, task-board changes, `$team-task`, or assignment to agents/workers.

## Codex Model Routing

Team Agent dispatches Codex workers only. Prefer `gpt-5.6-luna` for light
low-risk work, `gpt-5.6-terra` for normal coding, and `gpt-5.6-sol` only for
architecture, security, concurrency, or unclear root-cause work. Record the
requested and actual GPT-5.6 selection in the handoff. If Codex cannot provide
the required model, block the task instead of falling back to GPT-5.4 or older.

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
3. Map branch/worktree names back to task IDs when they contain patterns such as `T-082`, `T082`, `coder3-T082`, or task title slugs.
4. Treat unresolved matching branches/worktrees as active work even if `TASKS.md` is stale. Do not spawn a duplicate agent for that task or slot.
5. If the current worktree is dirty, compare changed paths with candidate task scopes and do not spawn overlapping writers until the dirty changes are understood.
6. Spawn only runnable coder tasks: dependencies done, slot free, clear scope, no overlapping write set, and no unresolved blocker.
   - Prefer `gpt-5.6-luna` for `coder-mini` and `gpt-5.6-terra` for regular coders.
   - Keep `coder-mini` to light, low-risk work only.
7. Require coder-completed tasks to report changed files and a short implementation note.
8. Move delivered scoped edits directly to DONE. Return to ASSIGNED only for a blocker or plainly incomplete implementation.
9. Do not run review, verification, security, test, or build gates unless the user explicitly requests them.
10. Stop when there is no runnable work, a task is blocked, tooling is unavailable, or the user interrupts.

## Manager Closeout

For each coder completion report, record changed files and move the task to DONE.

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
4. Move task ASSIGNED -> DONE.
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
- DONE entry records the change.
