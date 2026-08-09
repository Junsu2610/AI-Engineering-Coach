/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { renderBenchmarkReport } from './report';
import { validateExecutableFixtures } from './pilot';
import {
  scenarioTracks,
  scoreRun,
  summarizeBenchmark,
  validateConfigs,
  validateRun,
  validateSuite,
} from './scoring';
import type {
  BenchmarkConfigSet,
  BenchmarkRun,
  BenchmarkSuite,
  RunCategoryScores,
} from './types';

function fixtureSuite(): BenchmarkSuite {
  return {
    schemaVersion: 1,
    name: 'Fixture suite',
    description: 'Test fixture',
    repetitions: 3,
    minimumAutomaticWeight: 80,
    weights: {
      correctness: 45,
      safety: 15,
      quality: 10,
      autonomy: 10,
      efficiency: 10,
      evidence: 10,
    },
    hardFailureCodes: ['scope-violation'],
    scenarios: [{
      id: 'scenario-1',
      title: 'Scenario 1',
      category: 'test',
      difficulty: 'small',
      prompt: 'Complete the fixture task.',
      setup: ['Prepare a fixture.'],
      acceptance: ['Pass the verifier.'],
      automaticCategories: ['correctness', 'safety', 'quality', 'efficiency', 'evidence'],
      passScore: 70,
      minimumCorrectness: 60,
      budgets: {
        durationMs: { target: 100, limit: 200 },
        totalTokens: { target: 100, limit: 200 },
        costUsd: { target: 1, limit: 2 },
        toolCalls: { target: 10, limit: 20 },
      },
    }],
  };
}

function fixtureConfigs(): BenchmarkConfigSet {
  return {
    schemaVersion: 1,
    configs: [
      {
        id: 'model-neutral',
        harness: 'neutral',
        model: 'model',
        mode: 'controlled',
        role: 'baseline',
      },
      {
        id: 'model-harness',
        harness: 'harness',
        model: 'model',
        mode: 'controlled',
        role: 'candidate',
        baselineConfigId: 'model-neutral',
      },
      {
        id: 'model-harness-native',
        harness: 'harness',
        model: 'model',
        mode: 'native',
        role: 'native',
        baselineConfigId: 'model-neutral',
      },
    ],
  };
}

function fixtureScores(correctness: number): RunCategoryScores {
  return {
    correctness,
    safety: 100,
    quality: 80,
    autonomy: 100,
    evidence: 100,
  };
}

function fixtureRun(
  configId: string,
  correctness: number,
  hardFailures: string[] = [],
  scenarioId = 'scenario-1',
  iteration = 1,
): BenchmarkRun {
  return {
    schemaVersion: 1,
    status: 'completed',
    runId: `${configId}-${scenarioId}-r${iteration}`,
    scenarioId,
    configId,
    iteration,
    startedAt: '2026-08-07T00:00:00.000Z',
    metrics: {
      durationMs: 100,
      inputTokens: 50,
      outputTokens: 50,
      costUsd: 1,
      toolCalls: 10,
    },
    scores: fixtureScores(correctness),
    hardFailures,
  };
}

function readJson<T>(path: string): T {
  const parsed: unknown = JSON.parse(readFileSync(resolve(path), 'utf8'));
  return parsed as T;
}

describe('benchmark contracts', () => {
  it('validates the checked-in suite and example configs', () => {
    const suite = readJson<BenchmarkSuite>('benchmarks/model-harness-suite.json');
    const configs = readJson<BenchmarkConfigSet>('benchmarks/configs.example.json');
    const pilotConfigs = readJson<BenchmarkConfigSet>('benchmarks/configs.codex-sol-ultra.json');

    expect(validateSuite(suite)).toEqual([]);
    expect(validateExecutableFixtures(suite)).toEqual([]);
    expect(validateConfigs(configs)).toEqual([]);
    expect(validateConfigs(pilotConfigs)).toEqual([]);
    expect(suite.scenarios).toHaveLength(14);
    expect(pilotConfigs.configs[0]?.codexProvider?.baseUrl).toBe('http://127.0.0.1:9011/v1');
    expect(pilotConfigs.configs[0]?.mode).toBe('controlled');
  });

  it('defaults unclassified scenarios to both manager and coder tracks', () => {
    expect(scenarioTracks(fixtureSuite().scenarios[0]!)).toEqual(['manager', 'coder']);
  });

  it('accepts cursor-session configs without codexProvider', () => {
    const configs: BenchmarkConfigSet = {
      schemaVersion: 1,
      configs: [{
        id: 'cursor-grok-4.5-controlled-high',
        harness: 'cursor',
        model: 'grok-4.5',
        reasoningEffort: 'high',
        adapter: 'cursor-session',
        mode: 'controlled',
        role: 'candidate',
      }],
    };
    expect(validateConfigs(configs)).toEqual([]);
  });

  it('rejects cursor-session configs that declare codexProvider', () => {
    const configs: BenchmarkConfigSet = {
      schemaVersion: 1,
      configs: [{
        id: 'cursor-invalid',
        harness: 'cursor',
        model: 'grok-4.5',
        reasoningEffort: 'high',
        adapter: 'cursor-session',
        codexProvider: {
          id: 'nine_router_local',
          name: '9Router Local',
          baseUrl: 'http://127.0.0.1:9011/v1',
          envKey: 'OPENAI_API_KEY',
          wireApi: 'responses',
        },
        mode: 'controlled',
        role: 'candidate',
      }],
    };
    expect(validateConfigs(configs).some(error => error.includes('codexProvider'))).toBe(true);
  });

  it('keeps L01 manual-only and preserves manager/coder/shared track counts', () => {
    const suite = readJson<BenchmarkSuite>('benchmarks/model-harness-suite.json');
    const l01 = suite.scenarios.find(scenario => scenario.id === 'L01-checkpoint-resume');
    const manager = suite.scenarios.filter(scenario => scenarioTracks(scenario).includes('manager'));
    const coder = suite.scenarios.filter(scenario => scenarioTracks(scenario).includes('coder'));
    const shared = suite.scenarios.filter(scenario => {
      const tracks = scenarioTracks(scenario);
      return tracks.includes('manager') && tracks.includes('coder');
    });

    expect(l01?.fixture).toBeUndefined();
    expect(scenarioTracks(l01!)).toEqual(['manager', 'coder']);
    expect(manager).toHaveLength(10);
    expect(coder).toHaveLength(8);
    expect(shared).toHaveLength(4);
    expect(shared.map(scenario => scenario.id)).toEqual(expect.arrayContaining([
      'C01-large-context-routing',
      'E01-failing-check-recovery',
      'S01-dirty-worktree',
      'L01-checkpoint-resume',
    ]));
  });
});

describe('scoreRun', () => {
  it('applies category weights and automatic efficiency scoring', () => {
    const scored = scoreRun(fixtureSuite(), fixtureConfigs(), fixtureRun('model-neutral', 80));

    expect(scored.categoryScores.efficiency).toBe(100);
    expect(scored.efficiencyMetricCoverage).toBe(100);
    expect(scored.rawScore).toBe(89);
    expect(scored.finalScore).toBe(89);
    expect(scored.passed).toBe(true);
  });

  it('forces the final score to zero after a hard failure', () => {
    const scored = scoreRun(
      fixtureSuite(),
      fixtureConfigs(),
      fixtureRun('model-neutral', 100, ['scope-violation']),
    );

    expect(scored.rawScore).toBeGreaterThan(0);
    expect(scored.finalScore).toBe(0);
    expect(scored.passed).toBe(false);
  });

  it('rejects incomplete externally produced score records', () => {
    const run = fixtureRun('model-neutral', 80);
    const malformed = {
      ...run,
      scores: { safety: 100 },
    } as unknown as BenchmarkRun;

    expect(validateRun(fixtureSuite(), fixtureConfigs(), malformed)).toContain(
      `${run.runId}.correctness must be between 0 and 100`,
    );
  });
});

describe('summarizeBenchmark', () => {
  it('separates baseline, controlled uplift, and native score', () => {
    const suite = fixtureSuite();
    const configs = fixtureConfigs();
    const summary = summarizeBenchmark(suite, configs, [
      fixtureRun('model-neutral', 80),
      fixtureRun('model-harness', 100),
      fixtureRun('model-harness-native', 90),
    ]);
    const controlled = summary.configs.find(item => item.config.id === 'model-harness');
    const native = summary.configs.find(item => item.config.id === 'model-harness-native');

    expect(controlled?.modelBaseline).toBe(89);
    expect(controlled?.harnessUplift).toBe(9);
    expect(native?.nativeScore).toBe(93.5);
    expect(renderBenchmarkReport(summary)).toContain('Harness uplift');
  });

  it('uses a true median and includes failed-attempt cost', () => {
    const suite = fixtureSuite();
    const configs = fixtureConfigs();
    const first = fixtureRun('model-neutral', 100);
    const second = {
      ...fixtureRun('model-neutral', 20),
      runId: 'model-neutral-run-2',
      iteration: 2,
      metrics: { ...first.metrics, costUsd: 3 },
    };
    const summary = summarizeBenchmark(suite, configs, [first, second]);
    const baseline = summary.configs.find(item => item.config.id === 'model-neutral');

    expect(baseline?.score).toBe(79);
    expect(baseline?.costPerAcceptedTask).toBe(4);
  });

  it('reports manager, coder, and shared scenario coverage independently', () => {
    const base = fixtureSuite();
    const suite: BenchmarkSuite = {
      ...base,
      scenarios: [
        { ...base.scenarios[0]!, id: 'manager-only', tracks: ['manager'] },
        { ...base.scenarios[0]!, id: 'coder-only', tracks: ['coder'] },
        { ...base.scenarios[0]!, id: 'shared', tracks: ['manager', 'coder'] },
      ],
    };
    const summary = summarizeBenchmark(suite, fixtureConfigs(), [
      fixtureRun('model-neutral', 80, [], 'manager-only'),
      fixtureRun('model-neutral', 100, [], 'shared'),
    ]);
    const baseline = summary.configs.find(item => item.config.id === 'model-neutral');
    const manager = baseline?.tracks.find(item => item.track === 'manager');
    const coder = baseline?.tracks.find(item => item.track === 'coder');

    expect(manager).toMatchObject({
      completedScenarioCount: 2,
      suiteScenarioCount: 2,
      coverage: 100,
      score: 93.5,
    });
    expect(coder).toMatchObject({
      completedScenarioCount: 1,
      suiteScenarioCount: 2,
      coverage: 50,
      score: 98,
    });
  });

  it('balances track category columns by scenario when repetitions are uneven', () => {
    const base = fixtureSuite();
    const suite: BenchmarkSuite = {
      ...base,
      scenarios: [
        { ...base.scenarios[0]!, id: 'scenario-a', tracks: ['manager'] },
        { ...base.scenarios[0]!, id: 'scenario-b', tracks: ['manager'] },
      ],
    };
    const summary = summarizeBenchmark(suite, fixtureConfigs(), [
      fixtureRun('model-neutral', 100, [], 'scenario-a', 1),
      fixtureRun('model-neutral', 0, [], 'scenario-a', 2),
      fixtureRun('model-neutral', 100, [], 'scenario-b', 1),
    ]);
    const manager = summary.configs[0]?.tracks.find(item => item.track === 'manager');

    expect(manager?.categoryScores.correctness).toBe(75);
  });
});
