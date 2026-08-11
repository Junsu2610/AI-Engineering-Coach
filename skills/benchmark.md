---
name: benchmark
description: Run the model and harness benchmark through the adapter that matches the active agent host.
when_to_use: Use for /benchmark <harness> <modelEffort> [controlled|native] or requests to prepare, verify, resume, or aggregate benchmark scenarios.
---

# Benchmark

Resolve `$ARGUMENTS`, execute only the adapter that matches the active host, and preserve benchmark provenance.

## Steps

1. Run:

   ```powershell
   node scripts/benchmark-model.mjs $ARGUMENTS
   ```

2. Read `executionMode`, `configsPath`, `configId`, and `resultsRoot` from the output.
3. Branch by execution mode:
   - `claude-session`: continue only in an active Claude Code session.
   - `cursor-session`: continue only in an active Cursor session. In Claude Code, stop after configuration and tell the user to run the workflow from Cursor.
   - `codex-exec`: use the exact printed `full` command after its `OPENAI_API_KEY` and local 9Router preflight.
   - `codex-native-exec`: use the exact printed `full` command after confirming the Codex CLI has an active native login. Do not use 9Router or `OPENAI_API_KEY`.
4. For the matching active-session adapter, process each scenario and iteration with:

   ```powershell
   npm run benchmark:agents -- prepare --configs <configsPath> --config <configId> --scenario <scenarioId> --iteration <N> --results <resultsRoot>
   ```

   Complete the printed prompt only inside the prepared disposable workspace. Record commands actually run in a UTF-8 JSON array, for example:

   ```json
   [{"id":"command-1","command":"npm test","status":"completed","exitCode":0}]
   ```

   Then verify:

   ```powershell
   npm run benchmark:agents -- verify --configs <configsPath> --config <configId> --scenario <scenarioId> --iteration <N> --results <resultsRoot> --final-message "<concise English handoff>" --commands-file <commands.json>
   ```

5. Resume safely: if the run's `.session.json` exists, complete that workspace and run `verify`; otherwise run `prepare`. Never overwrite a completed run.
6. After all required runs are verified, aggregate without invoking another harness:

   ```powershell
   npm run benchmark:agents -- full --configs <configsPath> --config <configId> --track all --iterations 3 --results <resultsRoot>
   ```

7. Report overall score, Manager/Coder rows, hard failures, report paths, and automated coverage (`11/12` Manager, `8/9` Coder). State that active-session records are operator-assisted diagnostics and are not controlled-headline eligible.

## Constraints

- `claude-session` and `cursor-session` must not use Codex CLI, 9Router, `OPENAI_API_KEY`, or `127.0.0.1:9011`.
- `codex-native-exec` must preserve the signed-in user profile and must not add `--ephemeral`, `--ignore-user-config`, provider overrides, or feature-disable flags.
- Do not claim a command passed unless command evidence records its successful exit.
- Do not commit, push, deploy, delete prior results, or modify unrelated dirty files.
- `L01-checkpoint-resume` remains manual-only.

Details: `docs/agent-model-harness-benchmark.md`.
