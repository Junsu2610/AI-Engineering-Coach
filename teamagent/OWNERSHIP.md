# Ownership - File Map

Every writable file must have exactly one owner. If ownership is unclear, Manager
assigns before work starts.

## Coder 1 - <!-- TODO: domain -->

```text
# Example:
# app/storage.py
# app/main.py
# tests/test_storage.py
# tests/test_main.py
```

## Coder 2 - <!-- TODO: domain -->

```text
# Example:
# app/analyze.py
# app/utils.py
# tests/test_analyze.py
# tests/test_utils.py
```

## Coder 3 - <!-- TODO: domain -->

```text
# Example:
# app/web/
# app/templates/
# tests/test_web.py
```

## QA

- Read-only across repo.
- May write logs under `tests/qa_logs/`.
- Does not edit source.

## Specialist Roles

These are read-only by default:

- architect
- reviewer
- security
- verifier

They may write a short note to `TASKS.md` only when acting as the active agent
and the task explicitly asks for their report.

## Manager-Owned

```text
docker-compose.yml
Dockerfile
entrypoint.sh
requirements.txt
package.json
README.md
QUICKSTART.md
ARCHITECTURE.md
WORKFLOW.md
AGENTS.md
PROJECT_STATUS.md
.gitignore
.env.example
.github/
.claude/
teamagent/
docs/
ops-remote-nas.md
VERSION
```

## Conflict Resolution

1. Same file needed by multiple coders: Manager splits or sequences work.
2. Shared file needed: coder posts SHARED-FILE and stops.
3. Temporary access must name file, line range, reason, and expiration.
4. Dirty worktree/branch is preserved until Manager inspects it.

## Pre-Commit Checklist

- [ ] Changed files match ownership.
- [ ] No Manager-owned file edited without approval.
- [ ] Secret scan passed.
- [ ] Tests or evidence added.
- [ ] No runtime/private data staged.
