# Plan: Harness and Workflow Optimization

## Goal

Complete the agent harness and workflow layer after progressive disclosure merged: localize team-agent scaffold, unify dual-path startup (single-agent vs team-*), add hill-climb eval guardrails, and tighten adoption prompts — **docs/harness only**, no analyzer rewrite.

## Baseline

Progressive disclosure landed ([system-prompt-progressive-disclosure.md](./system-prompt-progressive-disclosure.md)): slim `AGENTS.md`, six on-demand skills, domain-routed `@aicoach` chat prompt.

```text
Always-on (AGENTS + Copilot stub)
  → match task → skills/*
  → agent-prompt-workflows → docs/agent-prompts/*
  → team-* only → team-agent bootstrap folder (load only when user invokes team-*)
Verify: npm run check / check:harness / git-and-verification skill
```

## Waves

| Wave | Focus | Outcome |
|---|---|---|
| A | Workflow scaffold | `WORKFLOW.md`, localized team-agent folder, TASKS archive to `HISTORY.md` |
| B | Harness paths | AGENTS/Copilot alignment, `repo-context`, CONTRIBUTING, gh-aw dedupe |
| C | Hill-climb + guardrails | `eval-scenarios/` F1–R3, `check:harness` script, plan Results update |
| D | Adoption loop | `weekly-coach-review`, `context-first-codex-workflow` skill pointers, this archive |

## Acceptance

- `AGENTS.md` ≤ 40 lines; privacy/worker/telemetry rules findable via grep.
- No `{{PROJECT_TITLE}}`, Python ownership examples, or missing `WORKFLOW.md` / `ops-remote-nas.md` pointers in the team-agent folder.
- Team-agent `TASKS.md` stays compact; old DONE in `HISTORY.md`.
- Eval scenario sheets exist; `npm run check:harness` passes.
- Single-agent and team-* paths documented in always-on (short pointer only — no default team playbook load).

## Out of scope

- Analyzer/rules product rewrite.
- P2 lint-warning-debt implementation (pointer only).
- Copying `00_Manager` NAS/Docker `WORKFLOW.md`.
- GitHub Issues unless explicitly requested.

## Status

**Approved and archived (2026-07-31).** Waves C–D complete in-repo; Waves A–B tracked in sibling PR slices. Revisit eval scenarios when harness files change materially.
