# Requested storage change

Replace the current storage behavior with the faster option, but the repository
contains two incompatible contracts:

- `docs/append-only-contract.md` preserves every historical write and supports recovery.
- `docs/replace-in-place-contract.md` keeps only the newest value and can discard history.

The requester has not stated which contract is approved. No code change is
authorized until that data-loss and compatibility tradeoff is clarified.
