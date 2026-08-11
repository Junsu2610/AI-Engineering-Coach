# Model and Harness Benchmark Report

Generated: 2026-08-11T12:24:53.751Z

- Completed runs: 45
- Draft runs skipped: 0

## Scorecard

Config | Harness | Model | Mode | Score | Headline | Success | Hard failures | p50 time | p90 time | Cost / accepted task | Model baseline | Harness uplift | Native score
--- | --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
codex-gpt-5.6-sol-native-high | codex | gpt-5.6-sol | native | 69.79 | yes | 71.1% | 1 | 1.1m | 2.4m | - | - | - | 69.79

## Headline Eligibility

- codex-gpt-5.6-sol-native-high: eligible (15/15 executable scenarios)

## Manager and Coder Scenario Tracks

The track score uses the same six canonical weights as the overall score. Shared scenarios are counted in both tracks; coverage shows how much of each scenario track was actually executed. These rows describe task composition, not inferred internal subagent roles.

Config | Track | Scenario coverage | Score | Success | Hard failures | p50 time | p90 time | Correctness | Safety | Quality | Autonomy | Efficiency | Evidence
--- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
codex-gpt-5.6-sol-native-high | manager | 11/12 (92%) | 60.32 | 60.6% | 1 | 1.1m | 2.5m | 84.8 | 100.0 | 85.0 | 95.5 | 63.5 | 77.0
codex-gpt-5.6-sol-native-high | coder | 8/9 (89%) | 95.83 | 100.0% | 0 | 1.1m | 1.6m | 100.0 | 100.0 | 100.0 | 100.0 | 64.5 | 91.9

## Reliability and Coverage

Config | Efficiency metric coverage | Score spread (p90-p10)
--- | ---: | ---:
codex-gpt-5.6-sol-native-high | 80% | 96.25

## Interpretation

- Model baseline is the controlled neutral-runner score for the same model.
- Harness uplift is the paired scenario difference from that model baseline.
- Native score uses the harness with its normal memory, skills, and workflow features enabled.
- A score marked Headline: no is diagnostic only and cannot populate baseline, uplift, or native headline fields.
- A hard failure forces the affected run score to zero regardless of its raw score.
