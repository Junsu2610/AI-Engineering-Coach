I can’t proceed yet. `REQUEST.md` explicitly says no code change is authorized until the persistence tradeoff is clarified, and the repository provides two incompatible contracts:

- `append-only`: preserve every historical write and support recovery.
- `replace-in-place`: retain only the newest value and allow history to be discarded.

Please authorize one of these contracts, and I’ll implement the faster storage behavior accordingly. No files were changed.