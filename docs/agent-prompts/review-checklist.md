# Review Checklist

Use this checklist before asking for review or merging a change.

## Correctness

- Inspect `git diff` before declaring completion.
- Does the change solve the stated task and nothing else?
- Do file names, commands, links, and examples match the repo?
- Would a teammate understand the expected behavior from the diff alone?

## Tests

- Run the required task checks
- If behavior changed, is there test coverage or explicit justification for docs-only work?
- Are failure cases or validation steps stated clearly in the evidence?

## Edge Cases

- What happens with missing context, empty input, or partial setup?
- Does the change still make sense in a dirty work tree?
- Does the guidance prevent repeated prompts or runaway loops?

## Security And Privacy

- No secrets, tokens, keys, or private runtime data added
- No telemetry or network behavior suggested in core analysis paths
- No instruction asks the agent to modify user session logs

## Generated Artifacts

- `dist/`, `docs/public/`, `node_modules/`, `*.vsix`, and test output stay untouched
- Only source docs or approved hand-authored files changed

## Scope Creep

- No edits outside the assigned scope
- No opportunistic refactor, rename, or package change
- If another file is needed, stop and raise `SHARED-FILE`

## Completion Report

Report:

- changed files
- docs-only or behavior change
- tests and checks run
- residual risk

For generated code, verify correctness, edge cases, and privacy/no-telemetry boundaries before approval.

## Copyable Prompt

```text
Review this change for correctness, required checks, edge cases, security/privacy, generated artifacts, and scope creep. Inspect git diff first, then report changed files, docs-only or behavior change, tests run, and residual risk.
```
