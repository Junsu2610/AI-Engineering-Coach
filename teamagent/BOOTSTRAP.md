# Bootstrap - Role Detection

## Detection

First user message selects the role.

```text
^do task a([1-3])$
^do task (architect|reviewer|security|verifier)$
^team-a([1-3])$
^team-(architect|reviewer|security|verifier)$
^team-(plan|task|auto|status)
```

| Message | Role | Playbook |
|---|---|---|
| `do task a1` | coder1 | `CODER.md` |
| `do task a2` | coder2 | `CODER.md` |
| `do task a3` | coder3 | `CODER.md` |
| `team-auto` mini worker | coder-mini | `CODER.md` |
| `do task architect` | architect | `ARCHITECT.md` |
| `do task reviewer` | reviewer | `REVIEWER.md` |
| `do task security` | security | `SECURITY.md` |
| `do task verifier` | verifier | `VERIFIER.md` |
| `team-a1` | coder1 | `CODER.md` |
| `team-a2` | coder2 | `CODER.md` |
| `team-a3` | coder3 | `CODER.md` |
| `team-architect` | architect subagent | `ARCHITECT.md` |
| `team-reviewer` | reviewer subagent | `REVIEWER.md` |
| `team-security` | security subagent | `SECURITY.md` |
| `team-verifier` | verifier subagent | `VERIFIER.md` |
| `team-plan <goal>` | manager plan only | `MANAGER.md` |
| `team-task` | manager writes tasks from approved plan | `MANAGER.md` |
| `team-auto` | manager delegates existing task-board work | `MANAGER.md` |
| `team-status` | manager status check | `MANAGER.md` |
| anything else | manager | `MANAGER.md` |

## Common Startup

1. Read `TASKS.md`.
2. Read `state/STATUS.json` if it exists, otherwise use `state/STATUS.example.json`.
3. Read `OWNERSHIP.md`.
4. Read your role playbook.
5. Check `git status --short`.

## Coder Auto-Claim

`coder-mini` is a lightweight internal coder slot for `team-auto`. It is spawned
only for light, low-risk tasks. Team Agent dispatches Codex workers only.

- Prefer `gpt-5.6-luna` for `coder-mini` and other light work.
- Use `gpt-5.6-terra` for normal coding and larger integrations.
- Reserve `gpt-5.6-sol` for architecture, security, concurrency, and unclear
  root-cause work.
- When native spawning inherits the active model, record the actual GPT-5.6
  selection. Block when the required profile is unavailable; never fall back to
  GPT-5.4 or older.

1. Find the first ASSIGNED task matching your slot.
2. Announce: `Claiming T-<id>: <subject>`.
3. Set your status in `state/STATUS.json` to `working`.
4. Create branch or worktree as required.
5. Begin without asking for confirmation.

If no task exists: `No work queued for <slot>. Standing by.`

## Specialist Auto-Claim

Specialists claim tasks explicitly tagged with their role, or the first REVIEW task
requesting their pass.

Use:

```text
Claiming T-<id> as <role>: <subject>
```

Specialists are read-only unless Manager explicitly grants a docs-only update.

## Manager Startup

1. Review all board sections.
2. Reconcile `state/STATUS.json` with actual branches/worktrees.
3. Move stale work back to BACKLOG or mark BLOCKED.
4. Assign clear next tasks with scope, contract, acceptance, and verification tier.

## Host Skill Shortcuts

When `$team-agent` is installed, prefer `team-*` commands for local workflow
role selection and Manager orchestration:

- `team-plan <goal>`: produce plan only.
- `team-task`: convert the active roadmap phase or approved/latest plan into `TASKS.md`; do not spawn.
- `team-auto`: Manager orchestration command and the only `team-*` command that may spawn subagents by default.
- `team-a1`/`team-a2`/`team-a3`: switch the current chat into that coder role and claim the matching task locally.
- `team-architect`/`team-reviewer`/`team-security`/`team-verifier`: spawn read-only specialists.
