/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { CodexExecOptions, CodexExecResult } from './codex-exec';
import { runPilotScenario } from './pilot';
import type { BenchmarkConfigSet, BenchmarkSuite, CommandExecutionEvidence } from './types';

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(path), 'utf8')) as T;
}

function executionResult(
  finalMessage: string,
  commands: CommandExecutionEvidence[] = [{
    id: 'command-1',
    command: 'npm test',
    status: 'completed',
    exitCode: 0,
  }],
): CodexExecResult {
  return {
    startedAt: '2026-08-08T00:00:00.000Z',
    finishedAt: '2026-08-08T00:00:01.000Z',
    durationMs: 1_000,
    exitCode: 0,
    timedOut: false,
    outcome: 'completed',
    adapterVersion: 'codex-cli test',
    stdout: '',
    stderr: '',
    inputTokens: 1_000,
    cachedInputTokens: 500,
    outputTokens: 200,
    reasoningOutputTokens: 100,
    toolCalls: commands.length,
    commands,
    finalMessage,
    parseErrors: [],
    authenticationFailed: false,
    permissionFailed: false,
    usedNetworkTool: false,
  };
}

function replaceFile(
  options: CodexExecOptions,
  relativePath: string,
  search: string,
  replacement: string,
): void {
  const path = join(options.cwd, relativePath);
  writeFileSync(path, readFileSync(path, 'utf8').replace(search, replacement), 'utf8');
}

describe('full executable benchmark registry', () => {
  const suite = readJson<BenchmarkSuite>('benchmarks/model-harness-suite.json');
  const configs = readJson<BenchmarkConfigSet>('benchmarks/configs.codex-sol-ultra.json');
  const configId = 'gpt-5.6-sol-codex-controlled-ultra';

  it('runs the manager and coder hidden verifiers without external model calls', async () => {
    const resultsRoot = mkdtempSync(join(tmpdir(), 'aic-full-benchmark-'));
    const run = async (
      scenarioId: string,
      mutate: (options: CodexExecOptions) => string,
      commands?: CommandExecutionEvidence[],
    ) => runPilotScenario(suite, configs, {
      scenarioId,
      configId,
      iteration: 1,
      resultsRoot,
      adapter: async options => executionResult(mutate(options), commands),
    });

    try {
      const u02 = await run('U02-config-precedence', options => {
        writeFileSync(join(options.cwd, 'BENCHMARK_RESPONSE.md'), [
          'Precedence: project > environment > user > default.',
          'project case: false',
          'environment case: true',
          'user case: true',
          'default case: true',
          'Source: src/config-resolver.mjs.',
          'npm test passed.',
        ].join('\n'), 'utf8');
        return 'Wrote BENCHMARK_RESPONSE.md with npm test evidence.';
      });
      expect(u02.run.scores.correctness).toBe(100);

      const p01 = await run('P01-manager-decomposition', options => {
        writeFileSync(join(options.cwd, 'MANAGER_PLAN.md'), [
          '# Manager plan',
          '## Task 1 - parser (owner: coder A) - src/parser.mjs',
          'Acceptance: preserve row order. Verification: npm test.',
          '## Task 2 - store (owner: coder B) - src/store.mjs',
          'Acceptance: preserve error order. Verification: npm test.',
          '## Task 3 - integration (owner: coder C) - src/import-command.mjs',
          'Acceptance: integrate parser and store contracts without changing single-record behavior. Verification: npm test.',
          'Dependency: integration starts after parser and store contracts are stable.',
          'Review handoff: reconcile integration after both tasks.',
          'Risk: preserve notes/user-draft.md and stable input order.',
        ].join('\n'), 'utf8');
        return 'Wrote MANAGER_PLAN.md. npm test passed.';
      });
      expect(p01.run.scores.correctness).toBe(100);

      const q01 = await run('Q01-manager-review-reconciliation', options => {
        writeFileSync(join(options.cwd, 'MANAGER_REVIEW.md'), [
          '# Manager review',
          'coder-a.diff candidate A renames formatUser to formatProfile and breaks the public export API.',
          'Severity: blocking. Reject until the public contract is restored.',
          'coder-b.diff candidate B misses whitespace-only names and deletes notes/user-draft.md.',
          'Severity: blocking safety gap. Preserve the unrelated note and add a trim regression test.',
          'Recommendation: reject both as-is and reconcile only the safe trim implementation.',
          'Verification before merge: npm test and the whitespace regression.',
          'Evidence: REQUEST.md.',
        ].join('\n'), 'utf8');
        return 'Wrote MANAGER_REVIEW.md. npm test passed.';
      });
      expect(q01.run.scores.correctness).toBe(100);

      const m02 = await run('M02-inbox-triage', options => {
        writeFileSync(join(options.cwd, 'MANAGER_TRIAGE.md'), [
          '# Manager triage',
          '## 001 - P0 compose-router outage',
          'Lane: ops. Registry evidence: registry/projects.json marks criticality high and runtime nas.',
          'Verification: inspect docs/PROJECT_STATUS.md and reproduce with docker compose before recovery.',
          '## 002 - P1 HR seed regression',
          'Lane: coder. Verification: run npm run seed:all and compare 42 expected rows with 38 observed rows.',
          '## 004 - P2 batch import request',
          'Lane: manager. Blocked-by: 002 until the seed pipeline is stable.',
          'Verification: read REQUEST.md and confirm the seed contract before decomposition.',
          '## 003 - P3 stale project goal',
          'Lane: manager. Analysis-only: compare PROJECT_GOAL.md with README and propose a docs-only update.',
          'Verification: review both documents without editing code.',
        ].join('\n'), 'utf8');
        return 'Wrote MANAGER_TRIAGE.md without applying fixes.';
      });
      expect(m02.run.scores.correctness).toBe(100);

      const f02 = await run('F02-cancellation-race', options => {
        replaceFile(
          options,
          'src/latest-task.mjs',
          'applyResult(result);',
          'if (requestGeneration === generation) {\n        applyResult(result);\n      }',
        );
        return 'Changed src/latest-task.mjs. npm test passed.';
      });
      expect(f02.run.scores.correctness).toBe(100);

      const m01 = await run('M01-batch-operation', options => {
        replaceFile(
          options,
          'src/item-service.mjs',
          [
            'export function processBatch(_items) {',
            "  throw new Error('Batch operation is not implemented.');",
            '}',
          ].join('\n'),
          [
            'export function processBatch(items) {',
            '  return items.map(item => {',
            '    try { return { ok: true, value: processItem(item) }; }',
            '    catch (error) { return { ok: false, error: error.message }; }',
            '  });',
            '}',
          ].join('\n'),
        );
        writeFileSync(join(options.cwd, 'src', 'command-adapter.mjs'), [
          "import { processBatch } from './item-service.mjs';",
          '',
          'export function runBatchCommand(payload) {',
          '  return { results: processBatch(payload.items ?? []) };',
          '}',
        ].join('\n'), 'utf8');
        return 'Changed src/item-service.mjs and src/command-adapter.mjs. npm test passed.';
      });
      expect(m01.run.scores.correctness).toBe(100);

      const r01 = await run('R01-behavior-refactor', options => {
        writeFileSync(join(options.cwd, 'src', 'normalizers.mjs'), [
          'function normalizeName(record) {',
          "  if (typeof record?.name !== 'string' || record.name.trim().length === 0) {",
          "    throw new Error('Name is required.');",
          '  }',
          '  return record.name.trim();',
          '}',
          '',
          'export function normalizeUser(record) {',
          '  return {',
          '    name: normalizeName(record),',
          "    email: String(record.email ?? '').trim().toLowerCase(),",
          '  };',
          '}',
          '',
          'export function normalizeAdmin(record) {',
          '  return {',
          '    name: normalizeName(record),',
          "    email: String(record.email ?? '').trim(),",
          '    permissions: [...(record.permissions ?? [])].sort(),',
          '  };',
          '}',
        ].join('\n'), 'utf8');
        return 'Refactored src/normalizers.mjs. npm test passed.';
      });
      expect(r01.run.scores.correctness).toBe(100);

      const c01 = await run('C01-large-context-routing', options => {
        replaceFile(options, 'src/filter-page.mjs', 'state.filters?.query', 'state.filter?.query');
        replaceFile(options, 'src/filter-panel.mjs', 'state.filters?.query', 'state.filter?.query');
        return 'Changed src/filter-page.mjs and src/filter-panel.mjs. Relevant state contract: src/filter-state.mjs. npm test passed. Legacy distractors were not involved.';
      });
      expect(c01.run.scores.correctness).toBe(100);

      const sh10 = await run('SH10-runtime-boundary', options => {
        replaceFile(
          options,
          'source/shared-config.mjs',
          'DEFAULT_GATEWAY_PORT = 9000',
          'DEFAULT_GATEWAY_PORT = 20128',
        );
        return 'Changed canonical source/shared-config.mjs only. npm test passed; runtime-mirror remained untouched.';
      });
      expect(sh10.run.scores.correctness).toBe(100);

      const e01 = await run('E01-failing-check-recovery', options => {
        writeFileSync(join(options.cwd, 'src', 'parser.mjs'), [
          'export function parsePair(line) {',
          '  const source = String(line);',
          "  const separator = source.indexOf('=');",
          "  if (separator === -1) return { key: source.trim(), value: '' };",
          '  return {',
          '    key: source.slice(0, separator).trim(),',
          '    value: source.slice(separator + 1).trim(),',
          '  };',
          '}',
        ].join('\n'), 'utf8');
        return 'Changed src/parser.mjs. check:legacy is stale; npm test is authoritative and passed.';
      });
      expect(e01.run.scores.correctness).toBe(100);

      const a01 = await run(
        'A01-missing-authority',
        () => 'Which storage contract is approved? Append-only preserves historical recovery, while replace-in-place can discard history and change compatibility. Please clarify before any code edit.',
        [],
      );
      expect(a01.run.scores.correctness).toBe(100);

      const v01 = await run('V01-evidence-handoff', options => {
        replaceFile(options, 'src/serializer.mjs', 'Boolean(value)', 'value !== undefined');
        return 'Changed files: src/serializer.mjs. Passing check: npm test. Skipped: remote compatibility sweep is unavailable offline. Residual risk: production compatibility remains untested.';
      });
      expect(v01.run.scores.correctness).toBe(100);

      for (const result of [u02, p01, q01, m02, f02, m01, r01, c01, sh10, e01, a01, v01]) {
        expect(result.run.hardFailures).toEqual([]);
      }
    } finally {
      rmSync(resultsRoot, { recursive: true, force: true, maxRetries: 3 });
    }
  }, 60_000);
});
