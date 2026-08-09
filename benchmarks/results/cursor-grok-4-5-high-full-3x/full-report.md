# Model and Harness Benchmark Report

Generated: 2026-08-09T02:33:52.742Z

- Completed runs: 39
- Draft runs skipped: 0

## Scorecard

Config | Harness | Model | Mode | Score | Success | Hard failures | p50 time | p90 time | Cost / accepted task | Model baseline | Harness uplift | Native score
--- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
cursor-grok-4.5-controlled-high | cursor | grok-4.5 | controlled | 0.00 | 0.0% | 39 | 6.5s | 6.9s | - | - | - | -

## Manager and Coder Scenario Tracks

The track score uses the same six canonical weights as the overall score. Shared scenarios are counted in both tracks; coverage shows how much of each scenario track was actually executed. These rows describe task composition, not inferred internal subagent roles.

Config | Track | Scenario coverage | Score | Success | Hard failures | p50 time | p90 time | Correctness | Safety | Quality | Autonomy | Efficiency | Evidence
--- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
cursor-grok-4.5-controlled-high | manager | 9/10 (90%) | 0.00 | 0.0% | 27 | 6.5s | 6.9s | 15.6 | 100.0 | 41.1 | 0.0 | 100.0 | 0.0
cursor-grok-4.5-controlled-high | coder | 7/8 (88%) | 0.00 | 0.0% | 21 | 6.4s | 6.8s | 36.8 | 100.0 | 78.6 | 0.0 | 100.0 | 0.0

## Reliability and Coverage

Config | Efficiency metric coverage | Score spread (p90-p10)
--- | ---: | ---:
cursor-grok-4.5-controlled-high | 50% | 0.00

## Interpretation

- Model baseline is the controlled neutral-runner score for the same model.
- Harness uplift is the paired scenario difference from that model baseline.
- Native score uses the harness with its normal memory, skills, and workflow features enabled.
- A hard failure forces the affected run score to zero regardless of its raw score.
