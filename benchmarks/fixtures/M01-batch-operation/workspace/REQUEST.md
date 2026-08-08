# Batch operation contract

Implement `processBatch(items)` and wire `runBatchCommand(payload)` to it.

- Return one result for every input item in the original order.
- A successful entry is `{ ok: true, value }`.
- A failed entry is `{ ok: false, error }` and must not stop later items.
- Empty input returns an empty result list.
- `runBatchCommand({ items })` returns `{ results }`.
- Do not change `processItem`, its exported name, or its exact error messages.
