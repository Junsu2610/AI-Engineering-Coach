/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { spawnSync } from 'node:child_process';
import {
  copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), 'aic-benchmark-model-'));
  const scriptsDirectory = join(root, 'scripts');
  const benchmarksDirectory = join(root, 'benchmarks');
  mkdirSync(scriptsDirectory, { recursive: true });
  mkdirSync(benchmarksDirectory, { recursive: true });
  const scriptPath = join(scriptsDirectory, 'benchmark-model.mjs');
  copyFileSync(resolve('scripts/benchmark-model.mjs'), scriptPath);
  const registryPath = join(benchmarksDirectory, 'models.json');
  const registry = `${JSON.stringify({
    schemaVersion: 1,
    provider: {
      id: 'nine_router_local',
      name: '9Router Local',
      baseUrl: 'http://127.0.0.1:9011/v1',
      envKey: 'OPENAI_API_KEY',
      wireApi: 'responses',
    },
    models: [],
  }, undefined, 2)}\n`;
  writeFileSync(registryPath, registry, 'utf8');
  return { root, benchmarksDirectory, scriptPath, registryPath, registry };
}

describe('benchmark model script', () => {
  it('resolves Codex native mode without joining native into the model id', () => {
    const fixture = createFixture();
    try {
      const result = spawnSync(
        process.execPath,
        [fixture.scriptPath, 'codex', 'gpt5.6solhigh', 'native'],
        { cwd: fixture.root, encoding: 'utf8', windowsHide: true },
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('"model": "gpt-5.6-sol"');
      expect(result.stdout).toContain('"reasoningEffort": "high"');
      expect(result.stdout).toContain('"mode": "native"');
      expect(result.stdout).toContain('"executionMode": "codex-native-exec"');
      expect(result.stdout).toContain('9Router and OPENAI_API_KEY are not used');
      expect(result.stdout).toContain('--iterations 1');
      expect(result.stdout).toContain('codex-gpt-5-6-sol-high-native-full-1x');
      expect(result.stdout).not.toContain('--iterations 3');
      expect(result.stdout).not.toContain('codex-gpt-5-6-sol-high-native-full-3x');

      const configsPath = join(
        fixture.benchmarksDirectory,
        'configs.codex-gpt-5-6-sol-high-native.json',
      );
      const configs = JSON.parse(readFileSync(configsPath, 'utf8')) as {
        configs: Array<Record<string, unknown>>;
      };
      expect(configs.configs[0]).toMatchObject({
        id: 'codex-gpt-5.6-sol-native-high',
        harness: 'codex',
        model: 'gpt-5.6-sol',
        reasoningEffort: 'high',
        adapter: 'codex-native-exec',
        mode: 'native',
        role: 'native',
      });
      expect(configs.configs[0]).not.toHaveProperty('codexProvider');

      const registry = JSON.parse(readFileSync(fixture.registryPath, 'utf8')) as {
        models: Array<Record<string, unknown>>;
      };
      expect(registry.models[0]).toMatchObject({
        configId: 'codex-gpt-5.6-sol-native-high',
        executionMode: 'codex-native-exec',
        executableHarness: 'codex-cli',
        mode: 'native',
      });
    } finally {
      rmSync(fixture.root, { recursive: true, force: true, maxRetries: 3 });
    }
  });

  it('resolves claudeext compact model tokens to a Claude agent session config', () => {
    const fixture = createFixture();
    try {
      const result = spawnSync(
        process.execPath,
        [fixture.scriptPath, 'claudeext', 'gpt5.6solxhigh'],
        { cwd: fixture.root, encoding: 'utf8', windowsHide: true },
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('"model": "gpt-5.6-sol"');
      expect(result.stdout).toContain('"reasoningEffort": "xhigh"');
      expect(result.stdout).toContain('"executionMode": "claude-session"');
      expect(result.stdout).toContain('"preflight": []');
      expect(result.stdout).toContain('no 9Router, no OPENAI_API_KEY');

      const configsPath = join(
        fixture.benchmarksDirectory,
        'configs.claudeext-gpt-5-6-sol-xhigh.json',
      );
      const configs = JSON.parse(readFileSync(configsPath, 'utf8')) as {
        configs: Array<Record<string, unknown>>;
      };
      expect(configs.configs[0]).toMatchObject({
        id: 'claudeext-gpt-5.6-sol-controlled-xhigh',
        harness: 'claudeext',
        model: 'gpt-5.6-sol',
        reasoningEffort: 'xhigh',
        adapter: 'claude-session',
        mode: 'controlled',
      });
      expect(configs.configs[0]).not.toHaveProperty('codexProvider');

      const registry = JSON.parse(readFileSync(fixture.registryPath, 'utf8')) as {
        models: Array<Record<string, unknown>>;
      };
      expect(registry.models[0]).toMatchObject({
        configId: 'claudeext-gpt-5.6-sol-controlled-xhigh',
        executionMode: 'claude-session',
        executableHarness: 'claudeext',
      });
    } finally {
      rmSync(fixture.root, { recursive: true, force: true, maxRetries: 3 });
    }
  });

  it('rejects an unsupported harness before writing registry or config files', () => {
    const fixture = createFixture();
    try {
      const result = spawnSync(
        process.execPath,
        [fixture.scriptPath, 'windsurf', 'gpt5.6high'],
        { cwd: fixture.root, encoding: 'utf8', windowsHide: true },
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Unknown harness "windsurf"');
      expect(readFileSync(fixture.registryPath, 'utf8')).toBe(fixture.registry);
      expect(readdirSync(fixture.benchmarksDirectory)).toEqual(['models.json']);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true, maxRetries: 3 });
    }
  });
});
