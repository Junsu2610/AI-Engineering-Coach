# AI Engineer Coach - Sprint Board

Single source of truth for assignments. Keep entries short and evidence-based.

## Roster

| Slot | Role | Status | Current task |
|---|---|---|---|
| manager | coordination | done | T-006-verify-codex-workflow-optimization |
| coder1 | agent instructions | done | T-004-refresh-agent-instructions |
| coder2 | agent prompt workflows | done | T-005-add-context-workflow-and-lint-plan |
| coder3 | <!-- TODO: domain --> | idle | - |
| qa | verification | done | T-006-verify-codex-workflow-optimization |
| architect | analysis | idle | - |
| reviewer | code review | idle | - |
| security | security review | idle | - |
| verifier | evidence gate | idle | - |

---

## ASSIGNED

Coders auto-claim the first task matching their slot. Specialists claim tasks
tagged with their role.

_(empty)_

---

## REVIEW

_(empty)_

---

## BLOCKED

_(empty)_

---

## BACKLOG

_(empty)_

---

## DONE (recent - archive in HISTORY.md)

### T-004-refresh-agent-instructions - Refresh stable agent instructions [coder1]

**Scope:** `.github/copilot-instructions.md`, `AGENTS.md`
**Goal:** Update stable agent instruction surfaces to reduce No Custom Instructions, Low Context Provision, and Prompt Cache Starvation without runtime behavior changes.
**Context:** `AGENTS.md`, `.github/copilot-instructions.md`, `package.json`, `summary/ai-engineer-coach-summary-2026-07-05.md`, `summary/ai-engineer-coach-summary-2026-07-05.json`
**Memory:** Approved Codex plan in chat; `teamagent/TASKS.md`; current Coach summary exports.
**Skills:** none required.
**Orchestration:** Wave 1 parallel with `T-005`; Manager reviewed before QA.
**Contract:** Keep Copilot instructions short and stable; sync `AGENTS.md` version truth with `package.json`; include repo/GitHub authority, Notion summary-only role, and accepted-plan archival.
**Acceptance:** PASS - instructions are concise and repo-specific, version truth matches `package.json`, and no runtime/code/dependency/generated files were edited.
**TDD:** not-applicable docs-only instruction update.
**Verification:** quick
**Risk:** low

**REVIEW - T-004-refresh-agent-instructions** by coder1 @ 2026-07-05T00:00:00Z
Branch: main working tree
Changed: `.github/copilot-instructions.md`, `AGENTS.md`.
Evidence:
- `git diff --check -- .github/copilot-instructions.md AGENTS.md`: PASS
- Secret scan on task files: PASS with wording-only policy matches; no secret values found.
- Manager readback confirmed version truth matches `package.json` and `src/core/runtime-debug.test.ts` remains outside scope.
Risk: low; `AGENTS.md` diff is larger due to ASCII/format normalization.

### T-005-add-context-workflow-and-lint-plan - Add context-first workflow and warning debt plan [coder2]

**Scope:** `docs/agent-prompts/context-first-codex-workflow.md`, `docs/plans/lint-warning-debt.md`
**Goal:** Add reusable docs that reduce Missing File Context, Repeated Prompts, Prompt Cache Starvation, and unmanaged lint-warning debt.
**Context:** `AGENTS.md`, `.github/copilot-instructions.md`, `docs/agent-prompts/`, `package.json`, `summary/ai-engineer-coach-summary-2026-07-05.md`, `summary/ai-engineer-coach-summary-2026-07-05.json`
**Memory:** Approved Codex plan in chat; `teamagent/TASKS.md`; current Coach summary exports.
**Skills:** none required.
**Orchestration:** Wave 1 parallel with `T-004`; Manager fixed one QA-found spelling issue before final verification.
**Contract:** English docs for context-first prompts and phased lint warning debt; no runtime behavior changes.
**Acceptance:** PASS - docs cover file references, prompt templates, repeated-prompt recovery, and the five lint-warning phases.
**TDD:** not-applicable docs-only workflow and plan update.
**Verification:** quick
**Risk:** low

**REVIEW - T-005-add-context-workflow-and-lint-plan** by coder2 @ 2026-07-05T00:00:00Z
Branch: main working tree
Changed: `docs/agent-prompts/context-first-codex-workflow.md`, `docs/plans/lint-warning-debt.md`.
Evidence:
- `git diff --check -- docs/agent-prompts/context-first-codex-workflow.md docs/plans/lint-warning-debt.md`: PASS
- Secret scan on task files: PASS with wording-only matches; no secret values found.
- Initial QA found `Hotspots` cspell issue; Manager changed it to `Hot Spots`.
Risk: low.

### T-006-verify-codex-workflow-optimization - Verify docs workflow optimization [qa]

**Scope:** `.github/copilot-instructions.md`, `AGENTS.md`, `docs/agent-prompts/context-first-codex-workflow.md`, `docs/plans/lint-warning-debt.md`
**Goal:** Verify the docs-only package implements the approved Codex workflow optimization and maps to the July 5 Coach anti-patterns.
**Context:** Changed files, Coach summary exports, and review notes from `T-004` and `T-005`.
**Memory:** Approved Codex plan in chat; `teamagent/TASKS.md`; current Coach summary exports.
**Skills:** requesting-code-review
**Orchestration:** Wave 2 after `T-004` and `T-005`; QA failed once on cspell, Manager fixed, then re-ran required checks.
**Contract:** Confirm anti-pattern coverage, version truth, protected path safety, stash preservation, and scope isolation.
**Acceptance:** PASS - required checks passed; generated/protected output paths were untouched; stash remains present; `src/core/runtime-debug.test.ts` remains outside sprint scope.
**TDD:** not-applicable docs-only verification.
**Verification:** standard
**Risk:** low

**QA - T-006-verify-codex-workflow-optimization** by qa @ 2026-07-05T00:00:00Z
Initial result: FAIL
Evidence:
- `npm run spellcheck`: FAIL on `docs/plans/lint-warning-debt.md` unknown word `Hotspots`.
- `npm run typecheck`: PASS
- `git diff --check -- .github/copilot-instructions.md AGENTS.md docs/agent-prompts/context-first-codex-workflow.md docs/plans/lint-warning-debt.md teamagent/TASKS.md`: PASS

**MANAGER FIX - T-006** @ 2026-07-05T00:00:00Z
Changed: `docs/plans/lint-warning-debt.md` (`Hotspots` -> `Hot Spots`).
Evidence:
- `npm run spellcheck`: PASS
- `npm run typecheck`: PASS
- `git diff --check -- .github/copilot-instructions.md AGENTS.md docs/agent-prompts/context-first-codex-workflow.md docs/plans/lint-warning-debt.md teamagent/TASKS.md`: PASS
- `git status --short -- dist docs/public '*.vsix' node_modules test-results .vscode-test`: PASS, no protected generated outputs changed.
- `git stash list --max-count=5`: PASS, `stash@{0}: On main: codex-before-upstream-update-2026-07-05` still present.
- `git status --short -- .github/copilot-instructions.md AGENTS.md docs/agent-prompts/context-first-codex-workflow.md docs/plans/lint-warning-debt.md teamagent/TASKS.md src/core/runtime-debug.test.ts`: PASS, only sprint docs/board plus pre-existing `src/core/runtime-debug.test.ts` outside scope.
Residual risk: low; existing untracked `Comment/`, `summary/`, and older `docs/agent-prompts/` files remain preserved.

### T-001-agent-context-instructions - Add stable agent context instructions [coder1]

**Scope:** `.github/copilot-instructions.md`, `docs/agent-prompts/task-template.md`
**Goal:** Add repo-local instructions and a reusable task prompt template to reduce missing context, no custom instructions, repeated prompts, and slow responses.
**Context:** Read `AGENTS.md`, `README.md`, `docs/agent-prompts/` if it exists, and `Comment/ai-engineer-coach-summary-2026-06-25.md`.
**Memory:** Latest approved plan in chat; `teamagent/TASKS.md`; Coach export in `Comment/`.
**Skills:** none required; use normal file search/edit tools only.
**Orchestration:** Wave 1 parallel with `T-002`; completed and QA verified through `T-003`.
**Contract:** Create concise Markdown docs only. `copilot-instructions.md` mirrors key repo rules from `AGENTS.md`. `task-template.md` includes `Context`, `Goal`, `Scope`, `Acceptance`, `Tests`, `Stop rule`, and `Output` sections with a copyable prompt.
**Acceptance:** PASS - files exist, content is repo-specific, no code or generated artifacts were modified in scope, Markdown is readable, and no secrets or private runtime data were introduced.
**TDD:** not-applicable docs-only configuration and prompt scaffolding.
**Verification:** quick
**Risk:** low

**REVIEW - T-001-agent-context-instructions** by coder1 @ 2026-06-25T14:55:00Z
Branch: main working tree
Changed: Added `.github/copilot-instructions.md` and `docs/agent-prompts/task-template.md`.
Evidence:
- `rg --files .github/copilot-instructions.md docs/agent-prompts/task-template.md`: PASS
- `Get-Content -Raw .github/copilot-instructions.md`: PASS
- `Get-Content -Raw docs/agent-prompts/task-template.md`: PASS
- `git diff --check -- .github/copilot-instructions.md docs/agent-prompts/task-template.md`: PASS
- Secret scan on task files: PASS
Risk: low

### T-002-agent-prompt-workflows - Add checkpoint, review, and weekly Coach workflows [coder2]

**Scope:** `docs/agent-prompts/checkpoint-workflow.md`, `docs/agent-prompts/review-checklist.md`, `docs/agent-prompts/weekly-coach-review.md`
**Goal:** Add reusable workflows that reduce runaway agent loops, speed-accept/code-review gaps, repeated prompts, and unsustainable work patterns.
**Context:** Read `AGENTS.md`, `README.md`, `Comment/ai-engineer-coach-summary-2026-06-25.md`, and any files created by `T-001` if present.
**Memory:** Latest approved plan in chat; `teamagent/TASKS.md`; Coach export in `Comment/`.
**Skills:** none required; use normal file search/edit tools only.
**Orchestration:** Wave 1 parallel with `T-001`; completed and QA verified through `T-003`.
**Contract:** Create concise Markdown docs only. Checkpoint workflow defines read-context-first, short plan checkpoint, 8 tool-call stop rule, and `plan -> implement -> verify`; review and weekly Coach docs cover accepted review and habit checks.
**Acceptance:** PASS - files exist, guidance is actionable and short, docs align with Coach findings, no code or generated artifacts were modified in scope, and no secrets or private runtime data were introduced.
**TDD:** not-applicable docs-only workflow scaffolding.
**Verification:** quick
**Risk:** low

**REVIEW - T-002-agent-prompt-workflows** by coder2 @ 2026-06-25T14:55:00Z
Branch: main working tree
Changed: Added checkpoint, review checklist, and weekly Coach workflow docs under `docs/agent-prompts/`.
Evidence:
- `Get-ChildItem docs/agent-prompts -File | Select Name,Length`: PASS
- `Get-Content docs/agent-prompts/checkpoint-workflow.md`: PASS
- `Get-Content docs/agent-prompts/review-checklist.md`: PASS
- `Get-Content docs/agent-prompts/weekly-coach-review.md`: PASS
- `git diff --check -- docs/agent-prompts`: PASS
- Secret scan on task files: PASS with wording-only matches; no secret values found.
Risk: low

### T-003-verify-agent-anti-pattern-docs - Verify anti-pattern reduction docs [qa]

**Scope:** `.github/copilot-instructions.md`, `docs/agent-prompts/`
**Goal:** Verify the docs/config package implements the accepted plan and is usable by Codex/Copilot workflows.
**Context:** Read `AGENTS.md`, `Comment/ai-engineer-coach-summary-2026-06-25.md`, `teamagent/TASKS.md`, and changed files from `T-001` and `T-002`.
**Memory:** Latest approved plan in chat; `teamagent/TASKS.md`; Coach export in `Comment/`.
**Skills:** requesting-code-review
**Orchestration:** Wave 2 after `T-001` and `T-002`; Manager approved after QA evidence.
**Contract:** Confirm final docs cover every accepted artifact and directly address highest Coach findings.
**Acceptance:** PASS - all artifacts exist, docs address required Coach findings, Markdown is readable/actionable, no code/generated artifacts were modified in scope, and no secrets/private runtime data were introduced.
**TDD:** not-applicable docs-only verification.
**Verification:** standard
**Risk:** low

**QA - T-003-verify-agent-anti-pattern-docs** by qa @ 2026-06-25T14:58:00Z
Result: PASS
Evidence:
- `rg --files .github/copilot-instructions.md docs/agent-prompts`: PASS
- `Get-Content` on all five created Markdown files: PASS
- `git diff --check -- .github/copilot-instructions.md docs/agent-prompts teamagent/TASKS.md`: PASS
- `git status --short -- .github/copilot-instructions.md docs/agent-prompts teamagent/TASKS.md`: PASS, only task-scope docs/team board files appeared.
- Secret scan on task files: PASS with wording-only matches; no secret values found.
Notes: Dirty changes outside task scope remain in `package-lock.json`, `package.json`, and `src/core/runtime-debug.test.ts`; not attributed to this sprint.

---

## Task Template

```text
### T-001 - <title> [coder1]

**Scope:** <files/dirs>
**Goal:** <outcome>
**Context:** <files/logs/docs to read first>
**Memory:** <PROJECT_GOAL/TASKS/plans/inbox/docs references>
**Skills:** <allowed tools/skills/subagents>
**Orchestration:** <parallel/sequential/dependencies/QA gate>
**Contract:** <interfaces/data/behavior>
**Acceptance:** <commands/checks>
**Verification:** quick|standard|strict
**Risk:** low|medium|high
```

