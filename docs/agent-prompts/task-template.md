# Task Prompt Template

Copy, fill in, and keep the prompt stable across follow-ups.

```text
Task: <short title>

Context
- Read first: AGENTS.md, README.md, <repo files>, <tests>, <docs>
- Relevant file references: #file <path>, #file <path>
- Constraints already known: <privacy, worker, API, UI, docs, etc.>

Goal
- <the exact outcome to achieve>

Scope
- Allowed files: <paths>
- Out of scope: <paths or areas not to touch>

Acceptance
- <observable result 1>
- <observable result 2>
- <scope boundary that must remain true>

Tests
- Run: <command>
- Also check: <smoke check or markdown sanity check>

Stop rule
- Stop and ask if the task needs files outside scope, changes public APIs/config, adds dependencies, adds network/telemetry, or conflicts with dirty changes from others.

Output
- Edit the files directly when requested.
- Reply concisely in Vietnamese.
- Report changed files, verification commands with PASS or FAIL, and remaining risk.
```

## Usage Notes

- Put the most stable instructions at the top so follow-up prompts can reuse them.
- Prefer file references over pasted code.
- Keep scope explicit to reduce repeated prompts and accidental drift.
- Name acceptance and tests before implementation so review is faster.
