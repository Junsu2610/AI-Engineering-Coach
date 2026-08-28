# Antigravity & Gemini Context

Always strictly read and follow the master project rules and architecture in:
1. `AGENTS.md` - Single Source of Truth for rules, boundaries, and test commands.
2. `docs/CURRENT_TASK.md` - Dynamic shared memory & current session progress.

## Key Antigravity Instructions
- Output language to user: Vietnamese (full diacritics).
- Code, diffs, comments, tests: English.
- Keep extension host responsive; offload heavy parsing to `src/core/*-worker.ts`.
- Run `npm test` after modifying code in `src/`.
- Before concluding any session, update `docs/CURRENT_TASK.md` with current state and next steps.
