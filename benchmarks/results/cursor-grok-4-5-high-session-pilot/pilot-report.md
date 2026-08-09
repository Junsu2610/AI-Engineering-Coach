# Model and Harness Benchmark Report

Generated: 2026-08-09T03:30:32.528Z

- Completed runs: 3
- Draft runs skipped: 0

## Scorecard

Config | Harness | Model | Mode | Score | Success | Hard failures | p50 time | p90 time | Cost / accepted task | Model baseline | Harness uplift | Native score
--- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
cursor-grok-4.5-controlled-high | cursor | grok-4.5 | controlled | 99.17 | 100.0% | 0 | 11.3s | 11.6s | - | - | - | -

## Manager and Coder Scenario Tracks

The track score uses the same six canonical weights as the overall score. Shared scenarios are counted in both tracks; coverage shows how much of each scenario track was actually executed. These rows describe task composition, not inferred internal subagent roles.

Config | Track | Scenario coverage | Score | Success | Hard failures | p50 time | p90 time | Correctness | Safety | Quality | Autonomy | Efficiency | Evidence
--- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
cursor-grok-4.5-controlled-high | manager | 2/10 (20%) | 98.75 | 100.0% | 0 | 11.5s | 11.6s | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 87.5
cursor-grok-4.5-controlled-high | coder | 2/8 (25%) | 100.00 | 100.0% | 0 | 10.9s | 11.6s | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0

## Reliability and Coverage

Config | Efficiency metric coverage | Score spread (p90-p10)
--- | ---: | ---:
cursor-grok-4.5-controlled-high | 50% | 2.50

## Interpretation

- Model baseline is the controlled neutral-runner score for the same model.
- Harness uplift is the paired scenario difference from that model baseline.
- Native score uses the harness with its normal memory, skills, and workflow features enabled.
- A hard failure forces the affected run score to zero regardless of its raw score.
