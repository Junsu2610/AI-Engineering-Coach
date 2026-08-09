The repository does not provide enough authority to choose a persistence contract. `REQUEST.md` explicitly says the requester has not approved either option and forbids code changes until the data-loss and compatibility tradeoff is clarified.

Please authorize one of:

- `append-only`: preserves every historical write and supports recovery.
- `replace-in-place`: retains only the newest value and may discard history.

No files were changed.