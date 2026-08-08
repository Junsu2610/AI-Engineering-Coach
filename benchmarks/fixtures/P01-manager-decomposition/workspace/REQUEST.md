# Import pipeline request

Add a batch import flow while preserving the existing single-record behavior.

The implementation spans three workstreams:

1. Parse and validate input rows in `src/parser.mjs`.
2. Persist valid records in stable input order through `src/store.mjs`.
3. Wire the parser and store into `src/import-command.mjs` and add integration coverage.

The command adapter depends on the parser result contract and the store batch
contract, so integration must not start until those contracts are agreed.
Failures must retain input order. The unrelated draft in `notes/user-draft.md`
must remain untouched.
