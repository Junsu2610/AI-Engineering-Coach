/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { BenchmarkSummary, ConfigSummary } from './types';

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

export function renderBenchmarkReport(summary: BenchmarkSummary): string {
  const rows = summary.configs.map(configRow).join('\n');
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

Config | Harness | Model | Mode | Score | Success | Hard failures | p50 time | p90 time | Cost / accepted task | Model baseline | Harness uplift | Native score
--- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---:
${rows}

## Reliability and Coverage

Config | Efficiency metric coverage | Score spread (p90-p10)
--- | ---: | ---:
${coverageRows}

## Interpretation

- Model baseline is the controlled neutral-runner score for the same model.
- Harness uplift is the paired scenario difference from that model baseline.
- Native score uses the harness with its normal memory, skills, and workflow features enabled.
- A hard failure forces the affected run score to zero regardless of its raw score.
`;
}
