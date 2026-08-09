# Model and Harness Benchmark Report

Generated: 2026-08-09T10:35:39.851Z

- Completed runs: 39
- Draft runs skipped: 0

## Scorecard

Config | Harness | Model | Mode | Score | Success | Hard failures | p50 time | p90 time | Cost / accepted task | Model baseline | Harness uplift | Native score
--- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
codex-gpt-5.6-sol-controlled-high | codex | gpt-5.6-sol | controlled | 88.34 | 79.5% | 0 | 2.3m | 4.1m | - | - | - | -

## Manager and Coder Scenario Tracks

The track score uses the same six canonical weights as the overall score. Shared scenarios are counted in both tracks; coverage shows how much of each scenario track was actually executed. These rows describe task composition, not inferred internal subagent roles.

Config | Track | Scenario coverage | Score | Success | Hard failures | p50 time | p90 time | Correctness | Safety | Quality | Autonomy | Efficiency | Evidence
--- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
codex-gpt-5.6-sol-controlled-high | manager | 9/10 (90%) | 84.99 | 70.4% | 0 | 2.3m | 4.0m | 86.3 | 100.0 | 84.8 | 88.9 | 68.3 | 81.7
codex-gpt-5.6-sol-controlled-high | coder | 7/8 (88%) | 96.50 | 100.0% | 0 | 2.8m | 4.1m | 100.0 | 100.0 | 100.0 | 100.0 | 71.2 | 98.1

## Reliability and Coverage

Config | Efficiency metric coverage | Score spread (p90-p10)
--- | ---: | ---:
codex-gpt-5.6-sol-controlled-high | 80% | 33.85

## Interpretation

- Model baseline is the controlled neutral-runner score for the same model.
- Harness uplift is the paired scenario difference from that model baseline.
- Native score uses the harness with its normal memory, skills, and workflow features enabled.
- A hard failure forces the affected run score to zero regardless of its raw score.
