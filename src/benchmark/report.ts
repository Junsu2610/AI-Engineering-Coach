/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { BenchmarkSummary, ConfigSummary, TrackSummary } from './types';

function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function formatNumber(value: number | undefined, suffix = ''): string {
  return value === undefined ? '-' : `${value.toFixed(2)}${suffix}`;
}

function formatDuration(value: number): string {
  const seconds = value / 1000;
  return seconds < 60 ? `${seconds.toFixed(1)}s` : `${(seconds / 60).toFixed(1)}m`;
}

function formatUplift(value: number | undefined): string {
  if (value === undefined) {
    return '-';
  }
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
}

function configRow(summary: ConfigSummary): string {
  return [
    escapeCell(summary.config.id),
    escapeCell(summary.config.harness),
    escapeCell(summary.config.model),
    summary.config.mode,
    summary.score.toFixed(2),
    summary.headlineEligible ? 'yes' : 'no',
    `${summary.successRate.toFixed(1)}%`,
    String(summary.hardFailureCount),
    formatDuration(summary.p50DurationMs),
    formatDuration(summary.p90DurationMs),
    formatNumber(summary.costPerAcceptedTask, ' USD'),
    formatNumber(summary.modelBaseline),
    formatUplift(summary.harnessUplift),
    formatNumber(summary.nativeScore),
  ].join(' | ');
}

function trackRow(configId: string, summary: TrackSummary): string {
  const categories = summary.categoryScores;
  return [
    escapeCell(configId),
    summary.track,
    `${summary.completedScenarioCount}/${summary.suiteScenarioCount} (${summary.coverage.toFixed(0)}%)`,
    summary.score.toFixed(2),
    `${summary.successRate.toFixed(1)}%`,
    String(summary.hardFailureCount),
    formatDuration(summary.p50DurationMs),
    formatDuration(summary.p90DurationMs),
    categories.correctness.toFixed(1),
    categories.safety.toFixed(1),
    categories.quality.toFixed(1),
    categories.autonomy.toFixed(1),
    categories.efficiency.toFixed(1),
    categories.evidence.toFixed(1),
  ].join(' | ');
}

function projectReadinessTier(score: number): string {
  if (score >= 90) return 'Elite Architect';
  if (score >= 80) return 'Project Standard';
  return 'Needs Improvement';
}

function pairRow(summary: ConfigSummary): string {
  const managerTrack = summary.tracks.find(t => t.track === 'manager');
  const coderTrack = summary.tracks.find(t => t.track === 'coder');
  const managerScore = managerTrack ? `${managerTrack.score.toFixed(2)}` : '-';
  const coderScore = coderTrack ? `${coderTrack.score.toFixed(2)}` : '-';
  const pairName = `${summary.config.harness} + ${summary.config.model}`;
  const tier = projectReadinessTier(summary.score);

  return [
    escapeCell(pairName),
    escapeCell(summary.config.id),
    summary.score.toFixed(2),
    escapeCell(tier),
    `${summary.successRate.toFixed(1)}%`,
    String(summary.hardFailureCount),
    managerScore,
    coderScore,
    formatDuration(summary.p50DurationMs),
  ].join(' | ');
}

export function renderBenchmarkReport(summary: BenchmarkSummary): string {
  const rows = summary.configs.map(configRow).join('\n');
  const pairRows = summary.configs.map(pairRow).join('\n');
  const headlineRows = summary.configs.map(config => (
    `- ${escapeCell(config.config.id)}: ${config.headlineEligible
      ? `eligible (${config.completedScenarioCount}/${config.requiredScenarioCount} executable scenarios)`
      : `diagnostic only - ${config.headlineExclusions.join('; ')}`}`
  )).join('\n');
  const coverageRows = summary.configs.map(config => [
    escapeCell(config.config.id),
    `${config.measurementCoverage.toFixed(0)}%`,
    config.scoreSpread.toFixed(2),
  ].join(' | ')).join('\n');
  return `# Model and Harness Benchmark Report

Generated: ${summary.generatedAt}

- Completed runs: ${summary.runCount}
- Draft runs skipped: ${summary.draftCount}

## Scorecard

Config | Harness | Model | Mode | Score | Headline | Success | Hard failures | p50 time | p90 time | Cost / accepted task | Model baseline | Harness uplift | Native score
--- | --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
${rows}

## Harness and Model Pair Real-World Project Performance

Config Pair | Config ID | Overall Score | Project Tier | Success Rate | Hard Failures | Manager Score | Coder Score | p50 Task Time
--- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---:
${pairRows}

## Headline Eligibility

${headlineRows}

## Manager and Coder Scenario Tracks

The track score uses the same six canonical weights as the overall score. Shared scenarios are counted in both tracks; coverage shows how much of each scenario track was actually executed. These rows describe task composition, not inferred internal subagent roles.

Config | Track | Scenario coverage | Score | Success | Hard failures | p50 time | p90 time | Correctness | Safety | Quality | Autonomy | Efficiency | Evidence
--- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
${summary.configs.flatMap(config => config.tracks.map(track => trackRow(config.config.id, track))).join('\n')}

## Reliability and Coverage

Config | Efficiency metric coverage | Score spread (p90-p10)
--- | ---: | ---:
${coverageRows}

## Interpretation

- Model baseline is the controlled neutral-runner score for the same model.
- Harness uplift is the paired scenario difference from that model baseline.
- Native score uses the harness with its normal memory, skills, and workflow features enabled.
- A score marked Headline: no is diagnostic only and cannot populate baseline, uplift, or native headline fields.
- A hard failure forces the affected run score to zero regardless of its raw score.
`;
}
