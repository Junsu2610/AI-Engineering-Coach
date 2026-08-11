# Model and Harness Benchmark: Antigravity Handoff

## Task

Finish the repository-local benchmark for comparing coding model and harness configurations, with explicit Manager and Coder scenario-track scores and a controlled Codex GPT-5.6 Sol Ultra configuration routed through 9Router.

## Goal

Deliver a reusable, evidence-based benchmark suite that can compare end-to-end coding configurations without incorrectly attributing all performance to the model alone.

## Scope

- Keep all verifier and scoring work local and offline.
- Keep the checked-in Codex adapter in controlled mode only.
- Support the local `nine_router_local` provider at `http://127.0.0.1:9011/v1`.
- Preserve the existing dirty worktree and all user changes.
- Do not commit, push, deploy, run the benchmark, or run project checks unless the user explicitly asks.

## Acceptance

- The suite defines 14 scenarios across Manager, Coder, and shared tracks.
- Thirteen scenarios have executable hidden verifiers; `L01-checkpoint-resume` has a manual interruption/resume kit.
- `full` supports `--track manager|coder|all`, multiple iterations, compatible-run resume, and report aggregation from the selected result root.
- Scenario categories are aggregated by scenario rather than raw iteration count.
- Verifiers protect secrets, visible tests, dirty Git state, scope, command evidence, and Manager-plan task contracts.
- Documentation includes the 9Router configuration, preflight, commands, score interpretation, coverage limits, and controlled/native attribution boundary.
- Before final completion is claimed, `npm run check` must pass. This verification is intentionally deferred at the user's request.

## Current State

- Workspace: `D:\01_PROJECT_CODE\AI Engineering Coach`
- Branch: `main`
- HEAD: `3a1905a` (`Add model and harness benchmark tooling`)
- Remote state observed at checkpoint: `main` is one commit ahead of `origin/main`.
- Current benchmark expansion is uncommitted.
- No benchmark, unit test, or `npm run check` was run after the final edits.

## Implemented Work

- Added a 14-scenario suite with 10 Manager scenarios, 8 Coder scenarios, and 4 shared scenarios.
- Added executable fixtures and hidden verifiers for 13 scenarios.
- Added the manual `L01-checkpoint-resume` kit with the oracle outside the visible workspace.
- Added the Codex GPT-5.6 Sol Ultra controlled configuration for 9Router.
- Added full-suite CLI track selection, resumable runs, and result-root aggregation.
- Added Manager/Coder report rows and scenario-balanced scoring.
- Added credential-aware artifact redaction and secret scanning across stdout, stderr, and final messages.
- Added detection for weakened visible tests and obvious test-command exit masking.
- Added dirty-worktree Git state checks and protected-file preservation.
- Added per-task owner, acceptance, and verification checks for Manager decomposition output.
- Added registry/fixture consistency validation.
- Added and expanded benchmark unit-test files, including CLI orchestration coverage.
- Updated the repository README and benchmark operator guide.

## Important Decisions

- `gpt-5.6-sol-codex-controlled-ultra` is a controlled Codex configuration score only. Do not label it a native score, neutral model baseline, or harness uplift.
- Manager and Coder values are scenario-track scores. Controlled Codex JSONL does not expose reliable internal subagent attribution.
- Automated coverage intentionally tops out at Manager `9/10` and Coder `7/8` because `L01-checkpoint-resume` is manual-only.
- Use a new dedicated result root for every real comparison. Do not overwrite or mix unrelated prior evidence.

## Main Changed Areas

- Benchmark contracts and docs:
  - `README.md`
  - `benchmarks/configs.codex-sol-ultra.json`
  - `benchmarks/model-harness-suite.json`
  - `docs/agent-model-harness-benchmark.md`
- Runner, verifier, scoring, and reporting:
  - `src/benchmark/types.ts`
  - `src/benchmark/codex-exec.ts`
  - `src/benchmark/pilot.ts`
  - `src/benchmark/cli.ts`
  - `src/benchmark/scoring.ts`
  - `src/benchmark/report.ts`
- Tests authored or expanded but not run:
  - `src/benchmark/codex-exec.test.ts`
  - `src/benchmark/pilot.test.ts`
  - `src/benchmark/scoring.test.ts`
  - `src/benchmark/cli.test.ts`
  - `src/benchmark/full-pilot.test.ts`
- New fixture directories:
  - `benchmarks/fixtures/A01-missing-authority/`
  - `benchmarks/fixtures/C01-large-context-routing/`
  - `benchmarks/fixtures/E01-failing-check-recovery/`
  - `benchmarks/fixtures/F02-cancellation-race/`
  - `benchmarks/fixtures/L01-checkpoint-resume/`
  - `benchmarks/fixtures/M01-batch-operation/`
  - `benchmarks/fixtures/P01-manager-decomposition/`
  - `benchmarks/fixtures/Q01-manager-review-reconciliation/`
  - `benchmarks/fixtures/R01-behavior-refactor/`
  - `benchmarks/fixtures/U02-config-precedence/`
  - `benchmarks/fixtures/V01-evidence-handoff/`

## Next Narrow Steps

1. Inspect the current diff for obvious TypeScript, fixture-contract, and CLI integration mistakes, focusing first on `src/benchmark/pilot.ts`, `src/benchmark/cli.ts`, `src/benchmark/pilot.test.ts`, and `src/benchmark/scoring.test.ts`.
2. Make only benchmark-scoped corrections; preserve all unrelated dirty work and do not alter the controlled/native boundary.
3. When the user authorizes verification, run `npm run check`. Run the real benchmark only as a separate later action with a fresh results root.

## Future Run Command

```powershell
npm run benchmark:agents -- full `
  --config gpt-5.6-sol-codex-controlled-ultra `
  --track all `
  --iterations 1 `
  --results benchmarks/results/gpt-5.6-sol-full-1x
```

## 9Router Preflight

```powershell
if ([string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) {
  throw 'OPENAI_API_KEY is required by the nine_router_local provider.'
}
Test-NetConnection 127.0.0.1 -Port 9011
```

## Copyable Antigravity Resume Prompt

```text
Continue the model-and-harness benchmark task in D:\01_PROJECT_CODE\AI Engineering Coach.

Read AGENTS.md and docs/plans/model-harness-benchmark-antigravity-handoff.md first. Preserve the dirty worktree and do not revert any existing changes. The benchmark implementation is largely present but has not been verified after the final edits. First review the benchmark diff for obvious integration or syntax mistakes, especially src/benchmark/pilot.ts, src/benchmark/cli.ts, src/benchmark/pilot.test.ts, and src/benchmark/scoring.test.ts. Keep the Codex adapter controlled-only and keep 9Router at http://127.0.0.1:9011/v1. Do not run npm run check, unit tests, or a real benchmark unless I explicitly authorize it.
```

## Residual Risk

The implementation has not received fresh compiler, lint, unit-test, or runtime evidence. Treat all completion claims as provisional until the required repository check passes.
