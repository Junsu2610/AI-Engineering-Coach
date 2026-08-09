The repository does not provide authority to choose the faster persistence contract. `REQUEST.md` explicitly says the requester must clarify the tradeoff first.

Please confirm one:

- `replace-in-place`: retain only the newest value; history may be discarded.
- `append-only`: preserve every historical write and support recovery.

No code was changed.