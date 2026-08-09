# Inbox triage request

You are acting as workspace manager for a small multi-project portfolio (see `registry/projects.json` and `docs/PROJECT_STATUS.md`).

Several items landed in `docs/inbox/` over the last 48 hours. The operator cannot work on everything at once.

Write `MANAGER_TRIAGE.md` that:

1. Orders the inbox items by **urgency and impact** (P0 first).
2. Labels each item with **lane**: `coder`, `manager`, or `ops` (deploy/runtime only).
3. States **blocked-by** dependencies where one item must wait for another.
4. Gives a **verification hint** per item (command or doc to read) without claiming work is done.
5. Calls out any item that is **analysis-only** and must not trigger code edits yet.

Do not edit source, tests, inbox files, or the registry. Do not apply fixes.
