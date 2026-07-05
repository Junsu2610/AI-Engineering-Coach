# {{PROJECT_TITLE}} - Lightweight Multi-Agent Team

This is a small-team agent protocol for repos under `D:\01_PROJECT_CODE`.
It keeps the workflow simple, but adds stronger planning, verification, status,
and optional worktree isolation inspired by heavier orchestration systems.

## Roles

| Trigger | Slot | Purpose | Writes? |
|---|---|---|---|
| anything else | manager | Plan, assign, review, merge, deploy | yes |
| `do task a1` | coder1 | Scoped implementation | yes |
| `do task a2` | coder2 | Scoped implementation | yes |
| `do task a3` | coder3 | Scoped implementation | yes |
| `do task a4` | qa | Runtime and acceptance verification | limited logs only |
| `do task architect` | architect | Read-only code/design analysis | no |
| `do task reviewer` | reviewer | Read-only code review | no |
| `do task security` | security | Read-only security review | no |
| `do task verifier` | verifier | Read-only evidence gate | no |

## Core Rules

- Source edits happen on `D:\01_PROJECT_CODE\<project>`, not `Q:` or NAS.
- `TASKS.md` is the sprint board. `state/STATUS.json` is local live status.
- Coders edit only their ownership scope.
- Reviewer/verifier/security roles do not self-approve their own work.
- No task is DONE without fresh evidence: tests, build, lint, smoke, or a stated reason why not.
- For real parallel coding, use git worktrees per coder.

## Agent Harness Model

Team Agent runs on:

```text
Agent = Reasoning + Memory + Context + Skills + Orchestration
```

| Layer | Team Agent meaning |
|---|---|
| Reasoning | Manager/worker model analysis and planning |
| Memory | `PROJECT_GOAL.md`, `AGENTS.md`, `TASKS.md`, plans, inbox, docs |
| Context | Files, logs, task scope, standards, and evidence loaded for this step |
| Skills | Shell, edit, search, browser, MCP, deploy/check/fix skills, subagents |
| Orchestration | Manager assignment, sequencing, dedupe, QA/evidence gates, stop rules |
 
Do not dispatch a worker until Memory, Context, allowed Skills, and the
Orchestration path are clear.

## Files

| File | Purpose |
|---|---|
| `BOOTSTRAP.md` | Role detection and startup flow |
| `MANAGER.md` | Manager playbook |
| `CODER.md` | Coder and QA playbook |
| `ARCHITECT.md` | Read-only analysis role |
| `REVIEWER.md` | Code review role |
| `SECURITY.md` | Security review role |
| `VERIFIER.md` | Evidence-based verification role |
| `OWNERSHIP.md` | File ownership map |
| `PROTOCOL.md` | Git, worktree, communication rules |
| `TASKS.md` | Sprint board |
| `state/STATUS.example.json` | Template for local worker status |
| `HISTORY.md` | Completed sprint archive |

## Recommended Flow

1. Manager decomposes work into scoped tasks with acceptance checks.
2. Architect reviews unclear design before implementation.
3. Coders work on feature branches or optional worktrees.
4. Reviewer checks diff quality.
5. Security checks risk-sensitive changes.
6. Verifier or QA runs fresh evidence checks.
7. Manager merges, syncs, deploys, and archives.

## Scale

Default scale is 1 manager, up to 3 coders, 1 QA, and specialist read-only roles.
If more writers are needed, split ownership first.
