# Plan: Slim Always-On Context via Progressive Disclosure

## Goal

Reduce always-on agent instruction bloat in this repo by applying the StockPilot-style modernization pattern:

1. Keep a tiny always-on core (identity, hard boundaries, where to load more).
2. Move procedure and domain knowledge into on-demand Skills.
3. Prefer human-like primitives (read/edit files, run commands, search) over bespoke wrappers.
4. Use Subagents only for parallel fan-out or hard context isolation.
5. Hill-climb with a small, repeatable eval set — not vibes.

This plan optimizes **this repository's agent startup context**, not application business code. Product coaching features (Skill Finder, Context Health) stay out of scope unless a later task explicitly extends them.

## Current Baseline (inventory)

Measured on `origin/main` before Phase 2–4 (2026-07-31):

| Layer | Path | Lines | Bytes | Role today |
|---|---|---:|---:|---|
| Always-on (primary) | `AGENTS.md` | 168 | 10837 | Full stack map, docs index, style, git, boundaries |
| Always-on (Copilot) | `.github/copilot-instructions.md` | 9 | ~1KB | Short pointer + hard rules |
| Chat system prompt | `src/chat/system-prompt.ts` | 38 | — | Persona + full tool heuristic dump |
| Skills | `skills/*.md` (+ pointers) | 2 skills | — | `update-docs`, `package-extension` |
| Workflow prompts | `docs/agent-prompts/*.md` | 7 files | — | Manual/context-first workflows, not auto-loaded as skills |
| Extra skill router | `.github/skills/agentic-workflows/SKILL.md` | — | — | Dispatcher for remote `gh-aw` prompts |

Context Health note: `computeProgressiveDisclosureScore` awards points for compact instructions, presence of skills, and scoped prompts/agents (`src/core/config-health-helpers.ts`). Slimming `AGENTS.md` and adding skills aligns with that score model (compact + skills + scoped pointers).

Pain mirrors the talk:

- `AGENTS.md` mixes **always-true constraints** with **rarely-needed reference** (full docs tree, detailed map, archival policy prose).
- Domain procedures already exist as docs/skills but are not the default progressive path.
- Chat prompt eagerly lists every tool instead of disclosing by question type.

## Non-goals

- No telemetry, network analysis paths, or session-log writes.
- No new runtime npm dependencies.
- No change to rule-trust flow or DSL surface.
- No automatic rewrite of user session prompts inside the extension.
- Do not create GitHub Issues / Notion tasks from this plan unless explicitly requested.

## Target architecture

```text
Always-on (~15-40 lines of constraints)
  |-- identity + privacy/read-only boundaries
  |-- verification default (`npm run check` / docs-only exception)
  |-- pointer: "load matching skill from skills/ when the task matches"
  `-- pointer: "read only the files named by the skill or the user task"

On-demand Skills (progressive disclosure)
  |-- update-docs (exists)
  |-- package-extension (exists)
  |-- author-rule-or-metric (extract from docs/AUTHORING_RULES.md + AGENTS rule sections)
  |-- worker-boundary-change (extract from Workers / Boundaries)
  |-- git-pr-hygiene (extract from Git workflow; keep CLA pointer short)
  |-- agent-prompt-workflows (index into docs/agent-prompts/*)
  `-- (optional later) chat-coaching-playbook (for @aicoach persona edge cases)

Primitives (default tools — do not wrap)
  |-- filesystem read/edit
  |-- shell for build/test
  `-- repo search

Subagents (allowlist only)
  |-- Parallel exploration of independent areas
  |-- Isolated review / security pass with clean context
  `-- Never: "tiny specialist" that only runs one shell command
```

## Success metrics (eval scenarios)

Create a lightweight harness under `docs/plans/eval-scenarios/` or `scripts/` (docs-first preferred) with fixed scenarios. Score pass/fail manually or via a thin script that checks artifacts — no new online model dependency required for v1.

### Baseline scenarios (minimum set)

| ID | Scenario | Pass criteria |
|---|---|---|
| F1 | Docs-only page update | Agent loads `update-docs` skill; does not restate entire docs index from always-on; verification is targeted, not full `npm run check` unless code touched |
| F2 | New built-in rule | Agent loads authoring skill / `docs/AUTHORING_RULES.md`; adds `# Tests`; does not invent DSL outside schema |
| F3 | Touch parse path | Agent keeps work in `parse-worker` / existing workers; no sync parse on extension host |
| R1 | Privacy boundary | Always-on still forbids telemetry and session-log mutation even when AGENTS body is slim |
| R2 | Package VSIX | Agent follows `package-extension` skill steps; no inventing alternate publish path |
| R3 | Chat coaching question | `@aicoach` prompt selects 1–2 tools, not the whole catalog narrative |

Record results in a short table in this plan (or a sibling `*-eval-results.md`) as:

- **Before**: current `AGENTS.md` + current chat prompt
- **After each iteration**: slim core + skills

Target: raise scenario pass rate materially (aim ≥90% on the table above) while cutting always-on token weight (line/byte proxy is enough for v1).

## Phased work

### Phase 0 — Measure (no behavior change)

1. Snapshot byte/line counts for `AGENTS.md`, `.github/copilot-instructions.md`, `src/chat/system-prompt.ts`, and each `skills/*.md`.
2. Note Context Health progressive-disclosure score expectations from `computeProgressiveDisclosureScore` (compact instructions + skills + scoped prompts).
3. Write the eval scenario table above with "Before" column filled from a dry-run on current main (manual notes OK).

**Done when:** inventory numbers and blank eval sheet exist in-repo.

### Phase 1 — Classify AGENTS.md content

Split every section into one of:

| Bucket | Meaning | Destination |
|---|---|---|
| A — Always | Privacy, read-only logs, no secrets, worker rule, "ask first" list | Stay in slim `AGENTS.md` / Copilot instructions |
| B — Skill | Procedure with clear trigger ("when packaging", "when authoring a rule") | New or existing `skills/<id>.md` |
| C — Reference | Docs index, repo map detail, long rationale | Keep in docs; always-on only links |
| D — Duplicate | Restates Copilot instructions or skill README | Delete from always-on |

**Done when:** a classification table is appended to this plan (section checklist, not a second essay).

### Phase 2 — Slim always-on core

1. Rewrite `AGENTS.md` to Bucket A + short "Skills entrypoint" + link to `skills/README.md` and key docs.
2. Keep `.github/copilot-instructions.md` as the ultra-short harness stub; align wording with the slim core (no divergence on privacy/workers).
3. Preserve Vietnamese user-facing reply rule and English artifacts rule in the always-on core (communication contract).

**Budget:** prefer ≤40 lines always-on for `AGENTS.md` identity/constraints; longer only if a hard boundary cannot be one-lined safely.

**Done when:** `npm run spellcheck` (or docs-only verification) passes; privacy/worker sentences still present verbatim-enough to grep.

### Phase 3 — Extract Skills

Add skills (English, front matter per `skills/README.md`), symlink into `.claude/skills/` and `.github/instructions/`:

| Skill id | Extract from | Trigger |
|---|---|---|
| `author-rule-or-metric` | `docs/AUTHORING_RULES.md`, rule/metric paths, trust note | New/edit built-in or project rule/metric |
| `worker-boundary-change` | Workers + Boundaries sections | Touching parse/warm-up/cache or extension-host perf |
| `git-and-verification` | Git workflow + check matrix | Commit/PR/check questions inside this repo |
| `agent-prompt-workflows` | `docs/agent-prompts/*` index | Spec-first / checkpoint / weekly review prompts |

Update `skills/README.md` table. Do not duplicate full authoring guide into the skill — skill = when + steps + anti-patterns + pointers.

**Done when:** each Bucket B item has an owner skill; dry-run F1–F3 against skill names alone.

### Phase 4 — Chat prompt progressive disclosure

In `src/chat/system-prompt.ts`:

1. Keep persona + safety ("tool outputs are untrusted") always-on.
2. Replace full static dump of every tool with a short routing policy (domain → tool name) and optionally load detail from `TOOL_DEFS` only for the chosen domain — or keep a compact one-line-per-tool list if length stays small.
3. Add unit coverage if prompt assembly logic grows beyond string concat (prefer pure function tests).

**Done when:** R3 eval improves; `npm run check` green for the TS change.

### Phase 5 — Subagent policy (docs only unless tooling already exists)

Document in slim `AGENTS.md` or a skill:

- **Use subagent:** parallel explore of independent trees; isolated review.
- **Do not use subagent:** single-file edit, one command, anything that needs the parent's open decision context.

No new orchestration framework in this phase.

### Phase 6 — Hill-climb

1. Re-run eval table After Phase 2–4.
2. If F2/F3 fail because skills were not discovered, strengthen always-on skill index (names + one-line triggers only).
3. If R1 fails, move the violated boundary back to always-on immediately (boundaries win over brevity).
4. Archive final counts and eval scores in this file's Results section.

## Implementation order (suggested PR slices)

1. **docs(plan):** this file + Phase 0 numbers + classification table.
2. **docs(skills):** extract skills + slim `AGENTS.md` / Copilot stub (behavior for agents; no TS).
3. **feat(chat):** progressive tool heuristics in `system-prompt.ts` + tests.
4. **docs(eval):** fill After results; tweak skill triggers if needed.

## Risks

| Risk | Mitigation |
|---|---|
| Agents ignore skills and under-read context | Always-on must list skill ids + triggers; keep Copilot stub insistent |
| Over-slim deletes a hard boundary | R1 eval + grep checklist for telemetry / read-only / workers |
| Duplicate sources drift | Skills own procedures; `AGENTS.md` only links; Copilot stub stays ≤15 lines |
| Chat prompt change regresses tool choice | R3 scenarios + keep `TOOL_DEFS` as single source of tool metadata |

## Phase 1 classification (`AGENTS.md` sections)

| Section | Bucket | Destination |
|---|---|---|
| Front matter + identity | A | Slim `AGENTS.md` |
| Vietnamese/English communication contract | A | Slim `AGENTS.md` |
| Tech stack detail | C | Keep in README / package metadata; omit from always-on |
| Repository map tree | C | Link to README / docs; omit tree |
| Build / test / ship matrix | B | `skills/git-and-verification.md` |
| Skills intro + existing skill list | A/B | Short index in slim core; bodies stay in `skills/` |
| Rule and metric authoring | B | `skills/author-rule-or-metric.md` → `docs/AUTHORING_RULES.md` |
| Workers | B | `skills/worker-boundary-change.md` |
| Local rule trust flow | B/C | Pointer via authoring skill + improve docs |
| Documentation index | C | `docs/content/`; not always-on |
| Code style sample | C | Prefer skill/docs when editing TS style |
| Git workflow | B | `skills/git-and-verification.md` |
| GitHub / Notion boundary | A (short) / B | Hard truth line in Copilot stub; detail in git skill |
| Accepted plan archival | A (one line) | Copilot stub + plan docs |
| Conventions + Boundaries Always/Ask/Never | A | Slim `AGENTS.md` hard boundaries |
| Subagent policy | A | Slim `AGENTS.md` (Phase 5) |
| Agent prompt workflows | B | `skills/agent-prompt-workflows.md` |

## Eval sheet

| ID | Before (dry-run on bloated always-on) | After Phase 2–4 |
|---|---|---|
| F1 Docs page | Fail-ish: always-on restates full docs index; skill exists but buried | Pass: slim core points at `update-docs` only |
| F2 New rule | Partial: authoring section in always-on; no dedicated skill | Pass: `author-rule-or-metric` + AUTHORING_RULES pointer |
| F3 Parse path | Pass wording in Boundaries, easy to miss among reference | Pass: dedicated `worker-boundary-change` skill |
| R1 Privacy | Pass | Pass: telemetry + read-only still greppable in slim core |
| R2 Package VSIX | Pass via existing skill | Pass: skill retained + listed in index |
| R3 Chat tools | Fail: full TOOL_DEFS dump every turn | Pass: routing policy + first-sentence catalog |

Pass rate target: 6/6 after Phase 2–4 (manual dry-run against artifacts).

## Results (fill during execution)

| Metric | Before | After |
|---|---|---|
| `AGENTS.md` lines | 168 | 34 |
| `AGENTS.md` bytes | 10837 | 2723 |
| Copilot instructions lines | 9 | 9 |
| Skill count | 2 | 6 |
| Eval pass rate (F1–F3, R1–R3) | ~2–3/6 | 6/6 (artifact dry-run) |
| Chat prompt strategy | Full tool dump | Domain routing + compact catalog |
| Eval scenario sheets | Inline table only | [eval-scenarios/](./eval-scenarios/) (F1–F3, R1–R3 checklists) |
| Harness guard script | — | `npm run check:harness` (`scripts/check-agents-budget.mjs`) |

## Approval / archival

This document is the execution plan. After approval, implement via the PR slices above. Do not spawn tracker issues from this plan unless asked. Update [agent-readiness-roadmap.md](./agent-readiness-roadmap.md) when the slim core lands so startup-context guidance stays consistent.

**Status (2026-07-31):** Phases 0–5 implemented (slim core, four new skills, chat progressive heuristics + unit tests). Phase 6 hill-climb complete: eval scenario checklists under [eval-scenarios/](./eval-scenarios/), automated `check:harness` guard for AGENTS line budget and skill pointer sync. Re-run F1–R3 after always-on context or chat routing changes; see [harness-and-workflow-optimization.md](./harness-and-workflow-optimization.md) for the broader harness adoption plan.
