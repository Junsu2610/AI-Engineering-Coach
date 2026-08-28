# CURRENT TASK & ACTIVE MEMORY

> **Purpose**: Shared dynamic scratchpad and active memory blackboard for AI harnesses (Antigravity/Gemini, Cursor, Codex, Claude Code, Grok Build).
> **Rule**: All agents must inspect this file before starting work. Update state, decisions, and next steps before finishing.

---

## Active State

- **Project**: AI Engineer Coach (VS Code Extension)
- **Session Goal**: Setup Unified Multi-Harness Memory & Context Sync across all project harnesses.
- **Status**: Completed setup and verification.

## Architecture Decisions Log

1. **Single Source of Truth**: All master architecture and project boundaries reside in `AGENTS.md`.
2. **Thin Pointers**: `GEMINI.md`, `CLAUDE.md`, `.cursor/rules/agents.mdc`, `.codex/instructions.md` forward context directly to `AGENTS.md` and `docs/CURRENT_TASK.md`.
3. **Zero Telemetry & Worker Boundary**: No network calls in core analyzer; heavy parsing executes in `src/core/*-worker.ts`.

## Required Verification Commands

- **Fast test**: `npm test`
- **Harness check**: `npm run check:harness`
- **Full check**: `npm run check`

## Next Steps

1. [x] Initialize `docs/CURRENT_TASK.md` as dynamic memory blackboard.
2. [x] Create thin harness forwarders: `GEMINI.md`, `.cursor/rules/agents.mdc`, `.codex/instructions.md`, `CLAUDE.md`.
3. [x] Add `scripts/sync-harness.mjs` and `sync:harness` npm script to `package.json`.
4. [x] Create workspace synchronizer `sync-workspace-harness.ps1` in `00_Manager/tools/`.
5. [x] Run verification suite and push changes to remote.
