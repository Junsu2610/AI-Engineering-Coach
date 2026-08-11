[2026-08-11 19:05:11] No changes were made. The repository explicitly says neither persistence contract is approved.

Please authorize one:

- **Append-only:** preserves all historical writes and recovery.
- **Replace-in-place:** likely faster, but discards historical values and may break consumers relying on them.