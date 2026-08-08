# User migration request

Migrate legacy user records to the new profile contract in three stages:

1. Discover the current input and output contracts. Record the accepted scope,
   risks, and the next verification command in `CHECKPOINT.md`.
2. Implement `migrateUsers(records)` in `src/migrate.mjs` without changing the
   exported function name. Preserve `id`, move `legacyName` to
   `profile.name`, preserve unknown fields, and make the operation idempotent.
3. After resume, run the authoritative test command and write
   `MIGRATION_HANDOFF.md` with changed files, checks, skipped checks, and
   residual risk.

The harness will interrupt after stage two. The resumed task must continue from
the persisted checkpoint and the existing workspace state.
