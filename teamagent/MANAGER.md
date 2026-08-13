# Manager Playbook

Manager owns planning, coordination, review decisions, merge, sync, and deploy.

## Boot

Run this boot only in Team mode.

1. Read the nearest project `AGENTS.md` or equivalent entry point.
2. Read `TASKS.md`, `OWNERSHIP.md`, `PROTOCOL.md`, and local `state/STATUS.json` if present.
3. Run `git status --short`.
4. Check recent work: `git log --oneline -10`.
5. Reconcile task board vs branches/worktrees.
6. Read `PROJECT_GOAL.md` before opening new work so scope, deploy target, and next focus are current.

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

## Execution Depth

- `fast`: default starting depth for every request; one cheap scoped inspection,
  direct Manager implementation, targeted acceptance, no task board, subagent,
  or separate review.
- `standard`: promote only on concrete coupled complexity, moderate risk, or
  broader regression/build needs; file count alone is not a trigger.
- `strict`: full taskification, subagents, specialist verification/review, and
  required safe-closeout gates for risky or release-critical work.

Record `Execution Depth` on task-based work. Promote before another write when
scope, overlap, risk, or required evidence exceeds the current depth.

## Verification Budget

- `fast`: one targeted acceptance pass after the logical change batch.
- `standard`: the fast pass plus at most one narrow regression/static/build
  check.
- `strict`: only the broader gates declared by acceptance or repo policy.
- Reuse passing evidence while relevant inputs are unchanged. Do not repeat
  full suites, Git status, hash, YAML, template, or broad scans for ceremony.

## Subagent Speed Gate

- Use zero subagents for plan-only, answer-only, status-only, small diagnostics,
  `fast` work, one workstream, or one writer.
- Spawn the minimum number only when at least two scopes are independent and
  expected parallel savings exceed spawn, wait, and reconciliation overhead.
- Disable nested delegation by default. The root Manager must explicitly
  authorize any strict task-specific exception.
- Give workers no-delegation instructions, keep useful Manager work in flight,
  and use one bounded wait wave. Stop waiting when local acceptance is ready.

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
**Worker Profile:** light | standard | deep
**Goal Scope:** <scope_fingerprint; required for team-goal tasks>
**Goal Outcome:** <sanitized execution-safe outcome; required for team-goal tasks>
**Execution Depth:** standard|strict
**Reasoning Effort:** low | medium | high | xhigh
**Acceptance:** <fresh checks required>
**TDD:** required | preferred | not-applicable <reason>
**Verification:** quick | standard | strict
**Evidence:** <required results and allowed skipped-check reasons>
**Tool Limits:** <project permissions or least-privilege constraints>
**Risk:** low | medium | high
```

Rules:

- Split cross-ownership work before assignment.
- Use specialist roles before coding when requirements, architecture, or risk are unclear.
- Inherit the project `AGENTS.md` and local `PROTOCOL.md` acceptance and
  verification floor. State concrete checks, required evidence, skipped-check
  reasons, and relevant tool or permission expectations in each task.
- One active writing task per coder.
- Use `coder-mini` only for light, low-risk docs, tests, small config, simple single-file fixes, or isolated low-risk code changes.
- Do not use `coder-mini` for auth, secrets, deploy, Docker/NAS, migrations, deletion, shared APIs, broad frontend changes, or medium/high-risk tasks.
- Edit `TASKS.md` only when the user explicitly asks for team tasks, task-board changes, `$team-task`, `$team-goal`, or assignment to agents/workers.

## Portable Model Routing

The Manager inherits the active model and reasoning effort; never pin or replace
it. Route workers by portable profile: `light` for isolated low-risk work,
`standard` for normal implementation, and `deep` for architecture, security,
integration, concurrency, or unclear root-cause work. Map profiles to models only
when the host supports explicit worker selection. Otherwise inherit the active
model and report it in the handoff. Block an unsatisfied required profile instead
of silently substituting a model.

## Assign

- Move work BACKLOG -> ASSIGNED only when ownership is clear.
- Update `state/STATUS.json` when assigning.
- Prefer worktrees for concurrent code edits:

```powershell
git worktree add .teamworktrees\coder1 -b feat/coder1-T001-slug main
```

## Team Auto Preflight

When the user calls `team-auto`, Manager runs the coordination loop in one chat:

1. Read the nearest project `AGENTS.md` (or equivalent entry point), `TASKS.md`,
   `OWNERSHIP.md`, and `PROTOCOL.md`; their acceptance and verification rules
   are the completion floor.
2. Run branch/worktree preflight before spawning:
   - `git status --short --branch`
   - `git branch --all --verbose --no-abbrev`
   - `git worktree list --porcelain`
   - `git for-each-ref refs/heads refs/remotes --format="%(refname:short) %(objectname:short) %(upstream:short) %(worktreepath)"`
   - optional when available: `gh pr list --state open`
3. Map branch/worktree names back to task IDs when they contain patterns such as `T-082`, `T082`, `coder3-T082`, or task title slugs.
4. Treat unresolved matching branches/worktrees as active work even if `TASKS.md` is stale. Do not spawn a duplicate agent for that task or slot.
5. If the current worktree is dirty, compare changed paths with candidate task scopes and do not spawn overlapping writers until the dirty changes are understood.
6. Apply the Subagent Speed Gate, then spawn only runnable coder tasks with positive expected elapsed-time savings: dependencies done, slot free, clear scope, `Execution Depth` is `standard` or `strict`,
   no overlapping write set, and no unresolved blocker. When called by `team-goal`, filter to tasks whose `Goal Scope` matches the Git-common-dir `team-goal/<scope_fingerprint>.json` checkpoint. Before creating replacements, the root Manager may adopt only exact legacy task IDs proven identical to the selected plan/phase in scope, acceptance, dependencies, and outcome; never bind the whole board or overwrite another goal scope.
   - Use the task's portable worker profile and keep `coder-mini` to `light`,
     low-risk work only.
   - Map the profile to a model only when the host supports it; otherwise record
     inherited routing.
7. Require coder-completed tasks to report changed files, fresh checks and
   results, skipped checks with reasons, and residual risk.
8. Keep coder-completed work in REVIEW until acceptance and the inherited
   project/protocol verification floor have fresh evidence. Changed files or a
   scoped edit report alone never permit DONE.
9. Aggregate and run declared `Acceptance` checks once at the selected `Verification` rigor; reuse passing evidence while relevant inputs are unchanged. Do not run undeclared or unrelated gates. Manager moves work to DONE only after inspecting evidence; coder self-report cannot approve completion.
10. Stop when there is no runnable work, a task is blocked, tooling is
    unavailable, or the user interrupts.

## Manager Closeout

For non-trivial REVIEW tasks, first run a spec compliance pass for goal,
contract, acceptance, ownership, and user-visible behavior. Then run a code quality pass
for correctness, maintainability, tests, edge cases, security, performance, and
regression risk.

Before DONE, satisfy task acceptance and the project/protocol verification floor
with fresh evidence. Standard verification means tests plus available lint,
type, and build checks; docs/config tasks use narrow relevant checks. Record
skipped checks with reasons and residual risk.

Reject format:

```text
**REJECTED - T-<id>** by manager @ <ISO timestamp>
Fail Reason: scope|requirement|logic|test|build|security|evidence
Reason: <specific failure>
Action: <what must change>
Evidence: <commands/results>
Skipped checks: <checks/reasons>
Residual risk: <none|notes>
```

## Merge

1. Ensure clean checks.
2. Merge only into `main`.
3. Delete finished feature branch/worktree when safe.
4. Move task REVIEW -> DONE after fresh evidence and Manager approval.
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
- the narrow relevant check and secret scan pass, and
- DONE evidence records the change, checks, and residual risk.
