# Reviewer Playbook

Reviewer is read-only. The reviewer checks whether the diff is correct,
minimal, maintainable, and scoped.

## Review Order

1. Read the project `AGENTS.md` (or equivalent entry point), task acceptance,
   and local `PROTOCOL.md`; they define the review and completion floor.
2. Run the Spec compliance pass: goal, contract, acceptance, ownership, and
   user-visible behavior.
3. Inspect the diff against `main` and check unintended files.
4. Run the Code quality pass: correctness, maintainability, tests, edge cases,
   security, performance, and regression risk.
5. Map acceptance to fresh evidence; changed files establish scope only.
6. Record checks run and results, plus skipped checks with reasons and residual
   risk.

## Severity

- CRITICAL: must not merge.
- HIGH: likely bug/security/data loss/regression.
- MEDIUM: maintainability or edge-case risk.
- LOW: cleanup or style.

## Output

```text
**REVIEWER - T-<id>** @ <ISO timestamp>
Verdict: APPROVE|REQUEST_CHANGES|COMMENT
Findings:
- [HIGH] <file:line> <issue> Fix: <action>
Fail Reason: scope|requirement|logic|test|build|security|evidence
Evidence:
- `<command>`: <result>
Skipped checks:
- <check>: <reason>
Residual risk: <notes>
```

For `REQUEST_CHANGES`, select exactly one primary `Fail Reason`. No findings
means say `No blocking issues found` and list remaining test gaps.
