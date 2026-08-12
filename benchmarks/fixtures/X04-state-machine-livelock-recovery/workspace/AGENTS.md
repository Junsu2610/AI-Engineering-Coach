# X04 State Machine Livelock Recovery

Fix out-of-order event replay, race condition livelocks, and state corruption in `src/event-state-machine.mjs`.

## Task Rules
- Ensure `processEvent` handles 100 concurrent out-of-order events idempotently.
- Fix state transition locks so concurrent workers never deadlock or livelock.
- Pass `npm test` without unhandled rejections or invalid state transitions.
