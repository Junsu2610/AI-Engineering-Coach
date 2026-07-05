# AI Engineering Coach Project Goal

## Goal

Build a read-only VS Code extension and Copilot canvas that analyzes local AI coding
session logs, surfaces engineering practice insights, and helps the user improve
agentic development habits without telemetry.

## Current Scope

In scope:
- Parse local AI assistant session logs from supported harnesses.
- Analyze sessions for anti-patterns, context health, output, workflow signals,
  and practice scores.
- Render the dashboard in the VS Code webview and GitHub Copilot app canvas.
- Keep all analysis local and read-only with respect to user logs.
- Provide repo-local skills, prompt templates, and workflow guardrails for
  recurring agentic engineering tasks.

Out of scope:
- Telemetry, remote logging, or automatic upload of user session data.
- Modifying user session logs.
- Marketplace publishing automation without an explicit release task.

## Progress

Done:
- Core dashboard, parser, analyzer, rules, metrics, and webview pages exist.
- VS Code extension commands and chat participant tools are wired.
- Context health, skill finder, anti-patterns, output, timeline, and learning
  pages are documented.
- Repo-local agent readiness docs and workflow guardrails exist.

In Progress:
- Keep docs, skills, rules, and package metadata aligned as the upstream project
  evolves.

Pending:
- Continue reducing warning debt and adding focused tests when analyzer or
  webview behavior changes.
- Package a VSIX only when a release task explicitly requests it.

## Phase Roadmap

| Phase | Focus | Outcome | Acceptance criteria | Status |
|---|---|---|---|---|
| P1 Agent Readiness | Repo-local workflow guardrails | Agents can start with concise context and correct boundaries | Context docs, prompts, profiles, and roadmap notes exist | Complete |
| P2 Warning Debt | Lint/type/spellcheck cleanup | Routine checks stay actionable and low-noise | Warning debt is documented and reduced through scoped tasks | In progress |
| P3 Release Packaging | VSIX package flow | Extension can be packaged and installed locally | `npm run package` creates an installable VSIX after checks pass | Pending |

## Runtime / Deploy

- Local: `D:\01_PROJECT_CODE\AI Engineering Coach`
- Runtime: VS Code extension host and GitHub Copilot app canvas.
- Data: local AI session logs are read-only inputs and must not be modified.
- Main checks: `npm run spellcheck`, `npm run typecheck`, `npm run check`.

## Next Focus

1. Keep agent workflow guardrails aligned with the workspace Manager rules.
2. Reduce warning debt only through focused, testable tasks.
3. Run `npm run check` before claiming behavior changes complete.

## Last Updated

2026-07-05
