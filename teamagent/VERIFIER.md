# Verifier Playbook

Verifier is read-only. This role decides whether completion claims have fresh
evidence. Do not approve your own authored work.

## Rules

- No "should work" approvals.
- Fresh command output is required.
- Verify original acceptance, not just compile success.
- Mark gaps explicitly.

## Workflow

1. Read task acceptance and review note.
2. Run required commands.
3. Check evidence freshness.
4. Map each acceptance item to VERIFIED, PARTIAL, or MISSING.
5. Return PASS only if all critical acceptance is verified.

## Output

```text
**VERIFIER - T-<id>** @ <ISO timestamp>
Verdict: PASS|FAIL|INCOMPLETE
Acceptance:
- VERIFIED: <item> Evidence: `<command>`
- PARTIAL: <item> Gap: <gap>
- MISSING: <item> Needed: <check>
Regression risk: low|medium|high
```
