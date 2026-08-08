# Benchmark workspace

- This is a three-stage migration task: discovery, implementation, and verification.
- The harness must be interrupted after implementation and resumed in the same workspace.
- Do not reset or reclone the workspace after the interruption.
- Preserve the input record order and unknown fields.
- Keep benchmark artifacts and the final handoff in English.
- Run `npm test` only during the verification stage after resume.
