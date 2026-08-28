# Codex Harness Instructions

Strictly follow the project architecture and boundaries defined in:
1. `AGENTS.md` - Primary single source of truth.
2. `docs/CURRENT_TASK.md` - Shared dynamic memory state and next actions.

## Rules
- Do not hallucinate file paths or external dependencies.
- Stick to the target files specified in `docs/CURRENT_TASK.md`.
- Run `npm test` after code changes to verify correctness.
- Update `docs/CURRENT_TASK.md` before finishing your task.
