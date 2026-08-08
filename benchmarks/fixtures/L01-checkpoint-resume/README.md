# L01 Checkpoint Resume Manual Kit

This fixture is intentionally manual. A real checkpoint test must interrupt the
selected harness after implementation and resume the same workspace with the
persisted checkpoint context.

## Procedure

1. Copy `workspace/` to a disposable directory outside the harness's source
   tree and run the scenario prompt from `benchmarks/model-harness-suite.json`.
2. Allow discovery and implementation to finish. Before the verification stage
   starts, interrupt the harness using its native pause or stop control.
3. Record the persisted checkpoint, workspace path, and the last completed
   acceptance item in the run record. Resume the same task without resetting or
   recloning the workspace.
4. After the resumed handoff, run the external oracle:

   ```powershell
   node benchmarks/fixtures/L01-checkpoint-resume/oracle/verify.mjs <workspace>
   ```

5. Fill the manual score fields and include the interruption and resume
   evidence in the final handoff.

The oracle is not copied into `workspace/`; keeping it outside the workspace
prevents the harness from reading the hidden acceptance cases.
