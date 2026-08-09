# Model and Harness Benchmark Report

Generated: 2026-08-09T08:27:06.761Z

- Completed runs: 45
- Draft runs skipped: 0

## Scorecard

Config | Harness | Model | Mode | Score | Headline | Success | Hard failures | p50 time | p90 time | Cost / accepted task | Model baseline | Harness uplift | Native score
--- | --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
cursor-grok-4.5-controlled-high | cursor | grok-4.5 | controlled | 100.00 | no | 100.0% | 0 | 0.6s | 0.8s | - | - | - | -

## Headline Eligibility

- cursor-grok-4.5-controlled-high: diagnostic only - adapter cursor-session is not headline-eligible; operator-assisted or non-executable records are diagnostic only

## Manager and Coder Scenario Tracks

The track score uses the same six canonical weights as the overall score. Shared scenarios are counted in both tracks; coverage shows how much of each scenario track was actually executed. These rows describe task composition, not inferred internal subagent roles.

Config | Track | Scenario coverage | Score | Success | Hard failures | p50 time | p90 time | Correctness | Safety | Quality | Autonomy | Efficiency | Evidence
--- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
cursor-grok-4.5-controlled-high | manager | 11/12 (92%) | 100.00 | 100.0% | 0 | 0.6s | 0.7s | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0
cursor-grok-4.5-controlled-high | coder | 8/9 (89%) | 100.00 | 100.0% | 0 | 0.6s | 0.8s | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0

## Reliability and Coverage

Config | Efficiency metric coverage | Score spread (p90-p10)
--- | ---: | ---:
cursor-grok-4.5-controlled-high | 50% | 0.00

## Interpretation

- Model baseline is the controlled neutral-runner score for the same model.
- Harness uplift is the paired scenario difference from that model baseline.
- Native score uses the harness with its normal memory, skills, and workflow features enabled.
- A score marked Headline: no is diagnostic only and cannot populate baseline, uplift, or native headline fields.
- A hard failure forces the affected run score to zero regardless of its raw score.
