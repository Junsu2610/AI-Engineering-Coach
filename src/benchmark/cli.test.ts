/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { loadReusableFullRun, selectFullScenarioIds } from './cli';
import { FULL_SCENARIO_IDS } from './pilot';
import type { BenchmarkConfigSet, BenchmarkRun, BenchmarkSuite } from './types';

function readSuite(): BenchmarkSuite {
  return JSON.parse(
    readFileSync(resolve('benchmarks/model-harness-suite.json'), 'utf8'),
  ) as BenchmarkSuite;
}

function readConfigs(): BenchmarkConfigSet {
  return JSON.parse(
    readFileSync(resolve('benchmarks/configs.codex-sol-ultra.json'), 'utf8'),
  ) as BenchmarkConfigSet;
}

describe('full benchmark selection', () => {
  it('selects all executable manager, coder, and shared scenarios', () => {
    const suite = readSuite();
    const all = selectFullScenarioIds(suite, 'all');
    const manager = selectFullScenarioIds(suite, 'manager');
    const coder = selectFullScenarioIds(suite, 'coder');

    expect(all).toEqual([...FULL_SCENARIO_IDS]);
    expect(all).not.toContain('L01-checkpoint-resume');
    expect(manager).toHaveLength(9);
    expect(coder).toHaveLength(7);
    expect(manager).toEqual(expect.arrayContaining([
      'P01-manager-decomposition',
      'Q01-manager-review-reconciliation',
      'C01-large-context-routing',
    ]));
    expect(coder).toEqual(expect.arrayContaining([
      'F01-surgical-boundary-fix',
      'F02-cancellation-race',
      'C01-large-context-routing',
    ]));
  });
});

describe('full benchmark resume', () => {
  let resultsRoot: string;

  afterEach(() => {
    if (resultsRoot !== undefined) {
      rmSync(resultsRoot, { recursive: true, force: true, maxRetries: 3 });
    }
  });

  it('reuses a compatible schemaVersion 2 completed run', () => {
    const suite = readSuite();
    const configs = readConfigs();
    const configId = 'gpt-5.6-sol-codex-controlled-ultra';
    const scenarioId = 'U01-root-cause-no-edit';
    const iteration = 1;
    const runId = `${scenarioId}-${configId}-r${iteration}`;
    resultsRoot = mkdtempSync(join(tmpdir(), 'aic-benchmark-resume-'));
    const directory = join(resultsRoot, configId);
    mkdirSync(directory, { recursive: true });
    const run: BenchmarkRun = {
      schemaVersion: 2,
      status: 'completed',
      runId,
      scenarioId,
      configId,
      iteration,
      startedAt: '2026-08-08T00:00:00.000Z',
      finishedAt: '2026-08-08T00:00:01.000Z',
      metrics: {
        durationMs: 1_000,
        inputTokens: 100,
        outputTokens: 50,
        toolCalls: 1,
        humanInterventions: 0,
      },
      scores: {
        correctness: 100,
        safety: 100,
        quality: 100,
        autonomy: 100,
        evidence: 100,
      },
      hardFailures: [],
      execution: {
        adapter: 'codex-exec',
        adapterVersion: 'test',
        model: 'gpt-5.6-sol',
        modelProvider: 'nine_router_local',
        reasoningEffort: 'ultra',
        mode: 'controlled',
        outcome: 'completed',
        timedOut: false,
        platform: 'win32',
        nodeVersion: process.version,
        parseErrors: [],
        commands: [],
        artifacts: {
          events: { path: `${runId}.events.jsonl`, sha256: 'a'.repeat(64), bytes: 1 },
          stderr: { path: `${runId}.stderr.txt`, sha256: 'b'.repeat(64), bytes: 1 },
          finalResponse: { path: `${runId}.final.md`, sha256: 'c'.repeat(64), bytes: 1 },
        },
      },
      verification: {
        verifierId: 'u01-root-cause',
        verifierVersion: '1.0.1',
        fixtureVersion: '1.0.1',
        fixtureSha256: 'd'.repeat(64),
        completedAt: '2026-08-08T00:00:01.000Z',
        changedFiles: ['BENCHMARK_RESPONSE.md'],
        commandResults: [],
        checks: [
          { id: 'diagnosis', category: 'correctness', score: 100, passed: true, evidence: 'ok' },
          { id: 'scope', category: 'safety', score: 100, passed: true, evidence: 'ok' },
          { id: 'quality', category: 'quality', score: 100, passed: true, evidence: 'ok' },
          { id: 'autonomy', category: 'autonomy', score: 100, passed: true, evidence: 'ok' },
          { id: 'evidence', category: 'evidence', score: 100, passed: true, evidence: 'ok' },
        ],
      },
    };
    const path = join(directory, `${runId}.json`);
    writeFileSync(path, `${JSON.stringify(run, undefined, 2)}\n`, 'utf8');

    const reusable = loadReusableFullRun(
      suite,
      configs,
      resultsRoot,
      scenarioId,
      configId,
      iteration,
    );

    expect(reusable?.path).toBe(path);
    expect(reusable?.run.runId).toBe(runId);
  });

  it('rejects an existing run with the wrong identity instead of overwriting it', () => {
    const suite = readSuite();
    const configs = readConfigs();
    const configId = 'gpt-5.6-sol-codex-controlled-ultra';
    const scenarioId = 'U01-root-cause-no-edit';
    resultsRoot = mkdtempSync(join(tmpdir(), 'aic-benchmark-resume-bad-'));
    const directory = join(resultsRoot, configId);
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      join(directory, `${scenarioId}-${configId}-r1.json`),
      `${JSON.stringify({
        schemaVersion: 2,
        status: 'completed',
        runId: 'wrong-id',
        scenarioId,
        configId,
        iteration: 1,
        startedAt: '2026-08-08T00:00:00.000Z',
        metrics: { durationMs: 1 },
        scores: {
          correctness: 0,
          safety: 0,
          quality: 0,
          autonomy: 0,
          evidence: 0,
        },
        hardFailures: [],
      }, undefined, 2)}\n`,
      'utf8',
    );

    expect(() => loadReusableFullRun(
      suite,
      configs,
      resultsRoot,
      scenarioId,
      configId,
      1,
    )).toThrow(/must be a schemaVersion 2|does not match the expected reusable run identity|execution is required/);
  });
});
