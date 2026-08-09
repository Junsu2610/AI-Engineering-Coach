# Cursor Grok 4.5 High Session Pilot Summary

Harness: `cursor-session` | Model: `grok-4.5` | Effort: `high` | Iteration: 1

Results root: `benchmarks/results/cursor-grok-4-5-high-session-pilot`

| Scenario | Score | Pass | Hard failures |
|----------|-------|------|---------------|
| A01-missing-authority | 100 | PASS | none |
| C01-large-context-routing | 100 | PASS | none |
| E01-failing-check-recovery | 100 | PASS | none |
| F01-surgical-boundary-fix | 100 | PASS | none |
| F02-cancellation-race | 100 | PASS | none |
| M01-batch-operation | 100 | PASS | none |
| P01-manager-decomposition | 100 | PASS | none |
| Q01-manager-review-reconciliation | 100 | PASS | none |
| R01-behavior-refactor | 100 | PASS | none |
| S01-dirty-worktree | 100 | PASS | none |
| U01-root-cause-no-edit | 97.5 | PASS | none |
| U02-config-precedence | 100 | PASS | none |
| V01-evidence-handoff | 100 | PASS | none |

## Overall

- Scenarios run: 13 / 14 executable (excluding L01)
- Passed: 13 / 13
- Average score: 99.8
- Not run: **L01-checkpoint-resume** (manual-only, requires harness interruption/resume)

## Notes

- Prior pilot runs (U01, F01, S01) reused from earlier session; new runs added for MVP-8 remainder and full-suite continuation.
- Verify cleanup occasionally logs `EPERM` on temp workspace deletion on Windows; scoring artifacts were still written successfully.
