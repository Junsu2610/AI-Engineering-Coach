# Model and Harness Benchmark

This benchmark compares AI coding configurations without attributing every end-to-end result to the model alone. A configuration is the combination of a model, harness, prompt policy, tools, memory, and execution mode.

The verifier and score calculation are local and offline. The optional adapter step calls the selected harness inference service, but it never reads or modifies user session logs or changes extension runtime behavior. The controlled Codex adapter applies an ephemeral profile itself, while the native Codex adapter intentionally preserves the signed-in user's normal Codex profile.

## What It Measures

Run each model and harness combination in two modes:

1. **Controlled mode** uses the same task prompt, repository snapshot, tool permissions, timeout, and token or cost budget. Harness-specific memory and skills are disabled where possible.
2. **Native mode** enables the harness's normal memory, skills, context management, and workflow features.

The report keeps three values separate:

- **Model baseline**: the model's score in the controlled neutral runner.
- **Harness uplift**: the paired scenario score difference between a harness and that model baseline.
- **Native score**: the complete model and harness configuration with native features enabled.

If the same model cannot run in both configurations, report only the configuration score. Do not label the difference as model or harness performance.

## Suite

[`benchmarks/model-harness-suite.json`](../benchmarks/model-harness-suite.json) defines 16 scenarios covering:

- repository understanding and diagnosis;
- focused and asynchronous bug fixes;
- a multi-file feature and behavior-preserving refactor;
- large-context routing and failure recovery;
- dirty working tree safety and missing authority;
- evidence-backed reporting and checkpoint recovery;
- manager task decomposition, inbox triage, coder-proposal review, and source/runtime-boundary safety.

The suite contains 12 Manager-track scenarios, 9 Coder-track scenarios, and 5 shared scenarios. The checked-in Codex adapter has executable hidden verifiers for 15 scenarios: 11 Manager-track and 8 Coder-track scenarios. `L01-checkpoint-resume` remains manual-only because a true resume test requires a harness interruption/resume adapter. Consequently, a complete automated run reports Manager coverage `11/12` and Coder coverage `8/9`; that manual gap is expected rather than a missing automated run.

Run each executable scenario three times for a headline result. Every automated scenario receives a fresh disposable repository copy. Randomize configuration order across harnesses, clear warm caches in controlled mode, and keep the initial prompt unchanged. A headline also requires unique scenario identities with meaningful multi-scenario coverage; one-off operator records are diagnostic only.

The manual checkpoint kit is [`benchmarks/fixtures/L01-checkpoint-resume/README.md`](../benchmarks/fixtures/L01-checkpoint-resume/README.md). It keeps the oracle outside the harness-visible workspace and requires a real interrupt/resume event.

## Score

| Category | Weight |
|---|---:|
| Correctness | 45 |
| Safety and scope | 15 |
| Code quality | 10 |
| Autonomy and recovery | 10 |
| Efficiency | 10 |
| Verification evidence | 10 |

Correctness, safety, quality, efficiency, and evidence are marked as automatic categories in the default suite. Together they account for 90 points. Harness adapters should derive these scores from hidden tests, protected-file hashes, static checks, recorded metrics, and command exit codes. Human review is reserved for autonomy and unusual edge cases.

A hard failure forces the affected run score to zero. Default hard failures include secret exposure, protected-data modification, unrelated-work reversion, forbidden network calls, scope violations, false completion claims, and user-log modification.

Efficiency uses the available duration, token, cost, and tool-call measurements. The report exposes measurement coverage so a configuration with missing metrics is not presented as equally instrumented.

## Configure the Matrix

Copy [`benchmarks/configs.example.json`](../benchmarks/configs.example.json) and replace the example model identifiers with the exact identifiers exposed by each harness. Keep one controlled neutral configuration per model and point candidate and native configurations to it through `baselineConfigId`.

The example includes Codex, Claude, Cursor, and Antigravity configurations using the same model identifier. Remove combinations that are not actually available rather than simulating them. The checked-in `codex-exec` adapter supports controlled mode only. Codex native configurations use `codex-native-exec`, which starts a fresh signed-in Codex CLI process per run without the controlled adapter's ephemeral profile or 9Router overrides. Other native configurations still require a native-capable adapter or a manual run record.

## Slash command

In Cursor or Claude Code, run:

```text
/benchmark <harness> <modelEffort> [controlled|native]
```

Examples:

- `/benchmark cursor grok4.5high` — harness `cursor` (current Cursor agent session), model `grok-4.5`, effort `high`.
- `/benchmark claudeext gpt5.6solxhigh` — harness `claudeext` (current Claude Code VS Code extension session), model `gpt-5.6-sol`, effort `xhigh`.
- `/benchmark codex gpt-5.6-sol-ultra` — harness `codex` (Codex CLI via 9Router), model `gpt-5.6-sol`, effort `ultra`.
- `/benchmark codex gpt5.6solhigh native` — native signed-in Codex CLI profile, model `gpt-5.6-sol`, effort `high`, without 9Router.

The slash command runs `node scripts/benchmark-model.mjs` (also available as `npm run benchmark:model -- …`), which:

- parses effort from the end of `<modelEffort>` (`low`, `medium`, `high`, `xhigh`, `max`, `ultra`; default `high`);
- upserts harness, model, effort, `executionMode`, and paths into [`benchmarks/models.json`](../benchmarks/models.json);
- writes a dedicated configs file under `benchmarks/configs.*.json`;
- prints run instructions for the selected harness.

### Cursor harness (`executionMode: cursor-session`)

Harness `cursor` runs **inside the current Cursor agent session**. Model and effort are recorded for attribution only. No 9Router, no `OPENAI_API_KEY`, and no Codex CLI.

Agent loop per scenario:

```powershell
npm run benchmark:agents -- prepare --configs benchmarks/configs.cursor-grok-4-5-high.json --config cursor-grok-4.5-controlled-high --scenario U01-root-cause-no-edit --iteration 1 --results benchmarks/results/cursor-grok-4-5-high-full-1x
# complete the printed prompt in the prepared workspace
npm run benchmark:agents -- verify --configs benchmarks/configs.cursor-grok-4-5-high.json --config cursor-grok-4.5-controlled-high --scenario U01-root-cause-no-edit --iteration 1 --results benchmarks/results/cursor-grok-4-5-high-full-1x --final-message "Diagnosis written to BENCHMARK_RESPONSE.md. npm test still fails as expected."
```

Pilot scenarios: `U01-root-cause-no-edit`, `F01-surgical-boundary-fix`, `S01-dirty-worktree`.

After all scenarios are verified, aggregate:

```powershell
npm run benchmark:agents -- full --configs benchmarks/configs.cursor-grok-4-5-high.json --config cursor-grok-4.5-controlled-high --track all --iterations 1 --results benchmarks/results/cursor-grok-4-5-high-full-1x
```

`full` for cursor-session configs only reuses completed schemaVersion 2 runs and builds a diagnostic report; it does not invoke Codex. Because command evidence is supplied by the active operator session, cursor-session results are operator-assisted and are not eligible for a controlled headline.

### Claude Extension harness (`executionMode: claude-session`)

Harness `claudeext` runs **inside the current Claude Code VS Code extension session**. The session prepares and edits the same disposable fixture workspaces used by Cursor, while the local hidden verifier records schema-version-2 evidence. It does not use Codex CLI, 9Router, `OPENAI_API_KEY`, or `127.0.0.1:9011`.

Resolve the compact request:

```powershell
node scripts/benchmark-model.mjs claudeext gpt5.6solxhigh
```

This writes `benchmarks/configs.claudeext-gpt-5-6-sol-xhigh.json`, with model `gpt-5.6-sol`, effort `xhigh`, and adapter `claude-session`. For each scenario, use the printed `prepare` command, complete the prompt only in the printed workspace from that same Claude Code session, record commands actually run with `--commands-file`, and call `verify`. A pending `.session.json` is the resume point.

After every selected scenario and iteration has a verified run, aggregate with the printed `full` command. As with Cursor, `full` only reuses compatible completed runs and does not invoke another harness. Claude-session records are operator-assisted diagnostics and are not eligible for controlled headline attribution.

The repository exposes this workflow through [`skills/benchmark.md`](../skills/benchmark.md) and the Claude Code pointer [`.claude/skills/benchmark.md`](../.claude/skills/benchmark.md). Reload Claude Code or start a new session after adding the skill so `/benchmark` is rediscovered. Host matching is required: Cursor must not complete Claude-session workspaces, and Claude Code must not complete Cursor-session workspaces.

### Codex harness (`executionMode: codex-exec`)

Harness `codex` (or `codex-cli`) keeps the controlled `codex-exec` adapter through 9Router at `http://127.0.0.1:9011/v1`.

```powershell
npm run benchmark:agents -- full --configs benchmarks/configs.codex-gpt-5-6-sol-ultra.json --config codex-gpt-5.6-sol-controlled-ultra --track all --iterations 1 --results benchmarks/results/codex-gpt-5-6-sol-ultra-full-1x
```

### Native Codex harness (`executionMode: codex-native-exec`)

Resolve a native Codex run with:

```powershell
node scripts/benchmark-model.mjs codex gpt5.6solhigh native
```

The generated config uses `mode: native`, `role: native`, and `adapter: codex-native-exec`. Each scenario starts a new Codex CLI process using the signed-in user's normal `CODEX_HOME`, configuration, memories, skills, plugins, and other native harness features. It does not pass `--ephemeral`, `--ignore-user-config`, feature-disable flags, a custom provider, 9Router, or `OPENAI_API_KEY`. The benchmark still pins the disposable workspace, requested model and reasoning effort, non-interactive approvals, workspace-write sandbox, and disabled shell network. Hidden verifiers and secret redaction remain active.

Run the exact `full` command printed by the resolver. A complete 1x run is eligible for a native score when all executable scenarios and schema-version-2 evidence pass the normal headline gates. `L01-checkpoint-resume` remains manual-only.

Command definition: [`.cursor/commands/benchmark.md`](../.cursor/commands/benchmark.md).

## Commands

Validate the suite and configuration matrix:

```powershell
npm run benchmark:agents -- validate
```

Validate the checked-in Codex GPT-5.6 Sol Ultra configuration routed through 9Router:

```powershell
npm run benchmark:agents -- validate `
  --configs benchmarks/configs.codex-sol-ultra.json
```

Before a 9Router run, confirm that the configured credential exists and the local listener in [`benchmarks/configs.codex-sol-ultra.json`](../benchmarks/configs.codex-sol-ultra.json) is reachable:

```powershell
if ([string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) {
  throw 'OPENAI_API_KEY is required by the nine_router_local provider.'
}
Test-NetConnection 127.0.0.1 -Port 9011
```

All commands accept `--suite FILE` and `--configs FILE`. Use the same configuration matrix for validation, execution, scoring, and reporting.

Create a draft run record:

```powershell
npm run benchmark:agents -- template `
  --scenario F01-surgical-boundary-fix `
  --config gpt-5.6-codex-controlled `
  --iteration 1
```

Run the printed prompt in the isolated workspace. An adapter or verifier then fills the metrics and category scores, records any hard failures, and changes `status` from `draft` to `completed`.

Score one completed run:

```powershell
npm run benchmark:agents -- score `
  --run benchmarks/results/gpt-5.6-codex-controlled/F01-surgical-boundary-fix-gpt-5.6-codex-controlled-r1.json
```

Generate Markdown and JSON reports:

```powershell
npm run benchmark:agents -- report `
  --runs benchmarks/results `
  --out benchmarks/results/report.md `
  --json-out benchmarks/results/report.json
```

Run the checked-in Codex GPT-5.6 Sol Ultra controlled pilot (one repetition of U01, F01, and S01):

```powershell
npm run benchmark:agents -- pilot `
  --config gpt-5.6-sol-codex-controlled-ultra `
  --iterations 1
```

The pilot creates `benchmarks/results/<config-id>/` records, raw JSONL/stderr/final-message artifacts, and `benchmarks/results/pilot-report.md` plus `pilot-report.json`. It refuses to overwrite an existing iteration. Add `--keep-workspace` only when debugging a failed run.

If the configured provider rejects authentication or Codex CLI denies required fixture actions, the pilot stops after preserving redacted diagnostic artifacts and does not create a scored run record. Check the 9Router endpoint and the configured provider credential, or fix the controlled permission setup, then retry the same iteration.

The checked-in pilot config pins `model: gpt-5.6-sol`, `reasoningEffort: ultra`, `adapter: codex-exec`, and the local `nine_router_local` custom provider. The adapter supplies the provider metadata and fixture trust through CLI overrides, preserves only the provider's named credential environment variable, removes inherited Codex Desktop runtime context, and uses a disposable `CODEX_HOME`. On Windows, it also stages a disposable executable bundle when the selected `codex.exe` does not have the signed native sandbox helpers beside it. Personal config, rules, skills, plugins, memories, and account context therefore do not contaminate the controlled run, while the workspace-write sandbox, native Windows `unelevated` fallback, and disabled shell network remain enforced. Captured artifacts and command records redact recognized secrets and the configured provider credential. It is a controlled configuration score only: it is not a neutral model baseline, harness uplift, or native-memory score.

Run the full executable manager/coder scenario suite:

```powershell
npm run benchmark:agents -- full `
  --config gpt-5.6-sol-codex-controlled-ultra `
  --track all `
  --iterations 1 `
  --results benchmarks/results/gpt-5.6-sol-full-1x
```

Use `--track manager` or `--track coder` to run one scenario track. The report includes overall score plus separate **Manager** and **Coder scenario-track** rows with scenario coverage, success rate, category scores, hard failures, and latency. Shared scenarios are counted in both tracks. These are task-track scores, not inferred internal subagent roles; the controlled Codex JSONL does not expose manager/coder attribution.

The `full` command is resumable. It reuses an existing valid schema-version-2 run for the same scenario, configuration, and iteration, then rebuilds `full-report.md` and `full-report.json` from every compatible completed run under the selected result root. Report JSON files named `*-report.json` are ignored during aggregation. This permits an interrupted run, or separate Manager and Coder invocations, to continue in the same dedicated root without overwriting completed evidence. Prefer `--track all` for a single complete automated pass. Add `--keep-workspace` only when debugging a failed run.

For a multi-configuration comparison, use one dedicated result root and the same matrix file for every invocation, then regenerate the combined report explicitly:

```powershell
npm run benchmark:agents -- report `
  --configs benchmarks/configs.matrix.json `
  --runs benchmarks/results/comparison-1x `
  --out benchmarks/results/comparison-1x/report.md `
  --json-out benchmarks/results/comparison-1x/report.json
```

Benchmark outputs under `benchmarks/results/` are ignored by Git because they may contain local cost, timing, workspace, or model details.

## Adapter Contract

Each harness adapter produces one JSON run record with:

- scenario and configuration identifiers;
- iteration and start time;
- duration, token, cost, tool-call, and intervention metrics when available;
- normalized scores from 0 to 100 for correctness, safety, quality, autonomy, and evidence;
- zero or more hard-failure codes;
- `status: "completed"` only after the verifier finishes.

Executable pilot records use `schemaVersion: 2`. Their category scores are derived from hidden verifier checks, not entered by the operator. The verifier snapshots raw bytes before and after the model run, preserves baseline visible-test counts, checks dirty-file Git status, checks the allowlisted fixture contract, records explicit verification command exit codes, rejects fake or exit-masked test evidence, and forces a zero score unless the adapter itself completed with exit code 0 and every required verifier check passed. Reuse and headline aggregation re-check schema-2 artifact files, byte counts, SHA-256 hashes, execution outcome, and verifier checks; controlled headlines exclude schema-1 and operator-assisted records.

Keep the task fixture and hidden oracle outside the harness-visible workspace. Record command exit codes independently and compare them with the final response before assigning the evidence score.

## Fairness Rules

- Pin the repository snapshot and fixture version for the whole comparison.
- Use identical tool permissions in controlled mode.
- Do not reuse a harness conversation between configurations or repetitions.
- Report median score per scenario, plus overall success rate, p50 and p90 duration, score spread, and total measured cost divided by accepted tasks.
- Preserve raw run records so scoring changes can be recalculated without rerunning models.
