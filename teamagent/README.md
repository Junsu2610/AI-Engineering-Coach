# {{PROJECT_TITLE}} - Lightweight Multi-Agent Team

This is a small-team agent protocol for repos under `D:\01_PROJECT_CODE`.
It keeps the workflow simple, but adds stronger planning, verification, status,
and optional worktree isolation inspired by heavier orchestration systems.

## Roles

| Trigger | Slot | Purpose | Writes? |
|---|---|---|---|
| non-Team request | normal harness routing | No Team state or protocol loading | no |
| `do task a1` | coder1 | Scoped implementation | yes |
| `do task a2` | coder2 | Scoped implementation | yes |
| `do task a3` | coder3 | Scoped implementation | yes |
| `team-auto` spawned mini worker | coder-mini | Light low-risk implementation; runtime-selected model | yes |
| `do task architect` | architect | Read-only code/design analysis | no |
| `do task reviewer` | reviewer | Read-only code review | no |
| `do task security` | security | Read-only security review | no |
| `do task verifier` | verifier | Read-only evidence gate | no |

## Core Rules

- Source edits happen on `D:\01_PROJECT_CODE\<project>`, not `R:` or NAS.
- `TASKS.md` is the sprint board. `state/STATUS.json` is local live status.
- Project `AGENTS.md` and local `PROTOCOL.md` are the acceptance and verification
  floor.
- Coders edit only their ownership scope and report changed files plus fresh
  check evidence, skipped checks with reasons, and residual risk.
- A changed-file report alone cannot approve DONE; Manager inspects evidence.
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
| Orchestration | Manager assignment, sequencing, dedupe, and stop rules |

Do not dispatch a worker until Memory, Context, allowed Skills, and the
Orchestration path are clear.

## Portable Model Routing

The Manager inherits the active model and reasoning effort. Worker contracts use
portable `light`, `standard`, or `deep` profiles. Map a profile to a model only
when the host supports explicit worker selection; otherwise inherit and report
the active model. Never pin the Manager or silently substitute a worker model.

## Files

| File | Purpose |
|---|---|
| `BOOTSTRAP.md` | Role detection and startup flow |
| `MANAGER.md` | Manager playbook |
| `CODER.md` | Coder implementation and evidence playbook |
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

1. Manager decomposes work into scoped tasks with acceptance and verification checks.
2. Architect reviews unclear design before implementation.
3. Coders work on feature branches or optional worktrees.
4. Coders move completed work to REVIEW with changed files and fresh evidence.
5. Required review, security, verifier, or QA gates run from project protocol and risk.
6. Manager marks DONE only after acceptance and verification evidence pass.

## Scale

Default scale is 1 manager, up to 3 regular coders, 1 `coder-mini` for light
low-risk tasks, and optional specialist read-only roles.
If more writers are needed, split ownership first.
