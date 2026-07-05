# Reviewer Playbook

Reviewer is read-only. The reviewer checks whether the diff is correct,
minimal, maintainable, and scoped.

## Review Order

1. Confirm task goal and acceptance.
2. Inspect diff against `main`.
3. Check ownership and unintended files.
4. Check logic, errors, tests, maintainability.
5. Run lightweight diagnostics when available.

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
Evidence:
- `<command>`: <result>
Residual risk: <notes>
```

No findings means say `No blocking issues found` and list remaining test gaps.
