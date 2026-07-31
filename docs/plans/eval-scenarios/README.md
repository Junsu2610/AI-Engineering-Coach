# Progressive Disclosure Eval Scenarios

Lightweight pass/fail harness for hill-climbing the agent startup context in this repo.
Derived from [system-prompt-progressive-disclosure.md](../system-prompt-progressive-disclosure.md).

## How to score

1. Pick a scenario ID (F1–F3 or R1–R3).
2. Open the scenario checklist and run a **dry-run** or a **real agent session** with the prompt stub in that file.
3. Mark each checklist item **PASS** or **FAIL**.
4. Scenario result:
   - **PASS** — all required items pass; no boundary violations.
   - **FAIL** — any required item fails, or a hard boundary (R1) is violated.
5. Record the run date, harness (Cursor / Copilot / Claude Code), and notes in the scenario file or a sibling `*-eval-results.md`.

Automated guardrails (`npm run check:harness`) cover AGENTS line budget and skill pointer sync only — scenario behavior is manual or artifact review.

## Scenario index

| ID | Type | Focus | File |
|---|---|---|---|
| F1 | Functional | Docs-only page update | [F1-docs-page.md](./F1-docs-page.md) |
| F2 | Functional | New built-in rule | [F2-new-rule.md](./F2-new-rule.md) |
| F3 | Functional | Parse / worker path | [F3-parse-path.md](./F3-parse-path.md) |
| R1 | Regression | Privacy boundaries | [R1-privacy.md](./R1-privacy.md) |
| R2 | Regression | Package VSIX | [R2-package-vsix.md](./R2-package-vsix.md) |
| R3 | Regression | Chat tool routing | [R3-chat-tools.md](./R3-chat-tools.md) |

## Pass-rate target

Aim **≥ 90%** (6/6) on F1–F3 and R1–R3 after slim core + skills land.
Re-run when always-on context, skills, or `src/chat/system-prompt.ts` routing changes materially.

## Baseline reference

| ID | Before (bloated always-on) | After Phase 2–4 |
|---|---|---|
| F1 | Fail-ish: full docs index in always-on | Pass: `update-docs` skill only |
| F2 | Partial: authoring in AGENTS, no skill | Pass: `author-rule-or-metric` |
| F3 | Pass but buried in reference | Pass: `worker-boundary-change` |
| R1 | Pass | Pass: telemetry + read-only findable via grep |
| R2 | Pass via skill | Pass: `package-extension` retained |
| R3 | Fail: full tool dump | Pass: domain routing + compact catalog |
