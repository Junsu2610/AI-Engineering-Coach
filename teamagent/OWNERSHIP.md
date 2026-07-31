# Ownership — File Map

Every writable file must have exactly one owner. If ownership is unclear, Manager
assigns before work starts.

## Coder 1 — agent instructions and chat harness

```text
skills/
.claude/skills/
.github/instructions/
src/chat/
src/chat/*.test.ts
```

## Coder 2 — agent prompt workflows and plans

```text
docs/agent-prompts/
docs/plans/
```

## Coder 3 — core analysis, webview, and MCP

```text
src/core/
src/webview/
src/mcp/
tests/e2e/
```

## QA

- Read-only across repo.
- May write logs under `test-results/` or task evidence notes in `TASKS.md`.
- Does not edit source.

## Specialist roles

Read-only by default: architect, reviewer, security, verifier.

They may write a short note to `TASKS.md` only when acting as the active agent
and the task explicitly asks for their report.

## Manager-owned

```text
package.json
package-lock.json
esbuild.mjs
README.md
CONTRIBUTING.md
CHANGELOG.md
WORKFLOW.md
AGENTS.md
PROJECT_GOAL.md
.gitignore
.github/
.claude/
teamagent/
docs/content/
docs/AUTHORING_RULES.md
docs/hugo.toml
scripts/
VERSION
```

## Conflict resolution

1. Same file needed by multiple coders: Manager splits or sequences work.
2. Shared file needed: coder posts SHARED-FILE and stops.
3. Temporary access must name file, line range, reason, and expiration.
4. Dirty worktree/branch is preserved until Manager inspects it.

## Pre-commit checklist

- [ ] Changed files match ownership.
- [ ] No Manager-owned file edited without approval.
- [ ] Secret scan passed.
- [ ] Tests or evidence added.
- [ ] No runtime/private data staged.
