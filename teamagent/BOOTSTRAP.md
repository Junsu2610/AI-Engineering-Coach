# Bootstrap - Role Detection

## Detection

First user message selects the role.

```text
^do task a(\d+)$
^do task (architect|reviewer|security|verifier)$
^team-a(\d+)$
^team-(architect|reviewer|security|verifier)$
^team-(plan|task|auto|status)
```

| Message | Role | Playbook |
|---|---|---|
| `do task a1` | coder1 | `CODER.md` |
| `do task a2` | coder2 | `CODER.md` |
| `do task a3` | coder3 | `CODER.md` |
| `do task a4` | qa | `CODER.md` |
| `do task architect` | architect | `ARCHITECT.md` |
| `do task reviewer` | reviewer | `REVIEWER.md` |
| `do task security` | security | `SECURITY.md` |
| `do task verifier` | verifier | `VERIFIER.md` |
| `team-a1` | coder1 | `CODER.md` |
| `team-a2` | coder2 | `CODER.md` |
| `team-a3` | coder3 | `CODER.md` |
| `team-a4` | qa | `CODER.md` |
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

## Codex Skill Shortcuts

When `$team-agent` is installed, prefer `team-*` commands for local workflow
role selection and Manager orchestration:

- `team-plan <goal>`: produce plan only.
- `team-task`: convert the active roadmap phase or approved/latest plan into `TASKS.md`; do not spawn.
- `team-auto`: Manager orchestration command and the only `team-*` command that may spawn subagents by default.
- `team-a1`/`team-a2`/`team-a3`: switch the current chat into that coder role and claim the matching task locally.
- `team-a4`: switch the current chat into QA role and verify the matching task locally.
- `team-architect`/`team-reviewer`/`team-security`/`team-verifier`: spawn read-only specialists.
