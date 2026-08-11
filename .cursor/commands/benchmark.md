---
name: benchmark
description: "Run the model+harness benchmark. Usage: /benchmark <harness> <modelEffort> [controlled|native]"
---

# Benchmark

Args: **$ARGUMENTS**

Do this now. Do not ask clarifying questions.

## 1. Resolve harness + model metadata

```powershell
node scripts/benchmark-model.mjs $ARGUMENTS
```

Example: `/benchmark cursor grok4.5high` → harness `cursor`, model `grok-4.5`, effort `high`.

Read the JSON output. Branch on `executionMode`:

If `executionMode` is `claude-session`, stop after configuration. A Claude-session fixture must be completed by the active Claude Code VS Code extension session, not by Cursor. Do not prepare, edit, verify, or aggregate that run from this host; tell the user to invoke `/benchmark` in Claude Code.

---

## 2a. When `executionMode` is `cursor-session` (harness = `cursor`)

**Meaning:** the harness under test is the **current Cursor agent session**. The model/effort args are metadata for attribution only. **Do not** use 9Router, Codex CLI, `OPENAI_API_KEY`, or `127.0.0.1:9011`.

1. Use the printed `configsPath`, `configId`, and `resultsRoot` from the script output.
2. For each scenario iteration (start with pilot scenarios `U01-root-cause-no-edit`, `F01-surgical-boundary-fix`, `S01-dirty-worktree`; then remaining full-track scenarios if doing a full run):
   ```powershell
   npm run benchmark:agents -- prepare --configs <configsPath> --config <configId> --scenario <scenarioId> --iteration <N> --results <resultsRoot>
   ```
   - Read the printed **workspace** path and **prompt**.
   - Complete the scenario **inside that workspace** in this Cursor session (edit only what the prompt allows).
   - Write a UTF-8 (no BOM) `--commands-file` JSON array of commands you actually ran, e.g. `[{"id":"command-1","command":"npm test","status":"completed","exitCode":0}]`. Omit claims that tests passed unless that file records a successful `npm test` / `node --test`.
   ```powershell
   npm run benchmark:agents -- verify --configs <configsPath> --config <configId> --scenario <scenarioId> --iteration <N> --results <resultsRoot> --final-message "<concise English handoff summarizing changes, checks run, and residual risk>" --commands-file <commands.json>
   ```
3. After all required scenarios are verified, aggregate the report (reuses completed runs; does not call Codex):
   ```powershell
   npm run benchmark:agents -- full --configs <configsPath> --config <configId> --track all --iterations 1 --results <resultsRoot>
   ```
4. If interrupted mid-scenario: if a `.session.json` manifest exists, finish the workspace task and run `verify`; otherwise re-run `prepare` for that scenario/iteration.
5. Report overall score, Manager/Coder track rows, hard failures, and report paths.
   Note: L01 is manual-only → automated coverage Manager 11/12, Coder 8/9.

---

## 2b. When `executionMode` is `codex-exec` (harness = `codex`)

**Meaning:** automated controlled runs through Codex CLI + 9Router.

1. Preflight: require `OPENAI_API_KEY`; confirm `127.0.0.1:9011` is open.
2. Run the exact `full` command printed by the script (fresh `--results` root).
3. If interrupted, re-run the same command to resume.
4. Report overall score, Manager/Coder track rows, hard failures, and report paths.
   Note: L01 is manual-only → automated coverage Manager 11/12, Coder 8/9.

---

## 2c. When `executionMode` is `codex-native-exec` (harness = `codex`, mode = `native`)

**Meaning:** automated native runs through a freshly started signed-in Codex CLI process per scenario.

1. Confirm the Codex CLI has an active native login.
2. Do not require or route through 9Router or `OPENAI_API_KEY`.
3. Run the exact `full` command printed by the script (fresh `--results` root).
4. If interrupted, re-run the same command to resume.
5. Report native score, Manager/Coder track rows, hard failures, and report paths.
   Note: L01 is manual-only → automated coverage Manager 11/12, Coder 8/9.

---

## Constraints

- Do not commit, push, deploy, or delete prior results.
- Preserve unrelated dirty worktree files.

Details: `docs/agent-model-harness-benchmark.md`
