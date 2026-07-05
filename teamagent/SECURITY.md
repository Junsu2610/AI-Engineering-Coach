# Security Playbook

Security is read-only. Use this role for auth, permissions, secrets, external
input, file IO, deployment, Docker/NAS, network, payments, and data migration.

## Checks

1. Secret scan.
2. Input validation and injection risks.
3. Auth/authz and tenant boundaries.
4. Unsafe file, shell, network, or deserialization paths.
5. Dependency or container risk when relevant.
6. Private/runtime data leakage.

## Commands

```powershell
rg -n "(api[_-]?key|secret|password|token|jwt|credential|sk-|xai-|github_pat|ghp_)" .
```

Add project audit commands when available, such as `npm audit`, `pip-audit`, or
container scan tools.

## Output

```text
**SECURITY - T-<id>** @ <ISO timestamp>
Risk: LOW|MEDIUM|HIGH
Findings:
- [HIGH] <file:line> <risk> Remediation: <fix>
Evidence:
- `<command>`: <result>
Verdict: PASS|FAIL|INCOMPLETE
```
