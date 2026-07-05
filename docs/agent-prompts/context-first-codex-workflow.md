# Context-First Codex Workflow

Use this workflow when starting a new Codex task or when a conversation begins to drift.

## Core Rules

- Reference `2-5` repo files before asking for implementation.
- Prefer repo file references over pasted code blocks.
- Keep a stable prompt prefix and swap only the task-specific file list.
- Do not resend the same prompt text if the first answer is weak. Add missing context or tighten scope instead.
- For non-trivial coding tasks, start with the mini spec in `docs/agent-prompts/spec-first-workflow.md`.
- Keep one session focused on one task type. Start a fresh task/session when switching between bug fix, feature, docs, deploy, or review.

## Stable Prompt Shape

Keep the front of the prompt stable:

1. Task
2. Goal
3. Scope
4. Acceptance
5. File references

Good file references:

- `AGENTS.md`
- `package.json`
- One task file or issue summary
- One or two nearby source, test, or doc files

Avoid loading a whole area of the repo when only a few files matter.

## File Reference Guidance

- Prefer `#file path/to/file` style references when the harness supports them.
- Point to repo truth first: task docs, source files, tests, package metadata, summaries.
- Paste code only for tiny excerpts that are not easy to reference by file.
- If a file is large, name the exact section or function to inspect.

## Copyable Templates

### Bug Fix

```text
Task: Fix <bug>.
Goal: Restore the expected behavior without unrelated refactors.
Scope: Only change <allowed files>.
Acceptance: <observable result>.
Read first: AGENTS.md, package.json, #file <task file>, #file <buggy file>, #file <test or nearby doc>.
```

### Feature

```text
Task: Implement <feature>.
Goal: Add the smallest complete version that satisfies the requirement.
Scope: Only change <allowed files>.
Acceptance: <observable result>.
Read first: AGENTS.md, package.json, #file <task file>, #file <source file>, #file <test file>, #file <related doc if needed>.
```

### Review

```text
Task: Review <change>.
Goal: Find correctness, regression, test, and scope risks.
Scope: Read-only review.
Acceptance: Findings ordered by severity with file references.
Read first: AGENTS.md, #file <task or summary>, #file <changed file 1>, #file <changed file 2>, #file <test or doc>.
```

### Docs

```text
Task: Update <doc>.
Goal: Keep the doc aligned with current repo behavior.
Scope: Only change <allowed docs>.
Acceptance: Wording matches repo truth and links resolve.
Read first: AGENTS.md, package.json, #file <doc to edit>, #file <source of truth>, #file <related workflow or summary>.
```

### Upstream Sync

```text
Task: Sync <upstream change>.
Goal: Apply only the relevant upstream behavior or wording.
Scope: Only change <allowed files>.
Acceptance: Local behavior/docs match the approved upstream subset.
Read first: AGENTS.md, #file <local target>, #file <local test/doc>, #file <upstream note or patch summary>.
```

### Package Or Tooling

```text
Task: Update <package or tooling config>.
Goal: Make the smallest safe config change.
Scope: Only change <allowed config/docs/tests>.
Acceptance: Required checks are listed and scope stays bounded.
Read first: AGENTS.md, package.json, #file <config file>, #file <affected source or test>, #file <task or summary>.
```

## Recovery Rule

If the model repeats itself, do not retry with the same wording. Change one of these inputs instead:

- add one missing repo file reference
- narrow the scope
- restate the acceptance check
- ask for review instead of implementation

If 2 attempts fail with the same error class, stop and summarize what was tried, the exact blocker, and one alternate approach.
