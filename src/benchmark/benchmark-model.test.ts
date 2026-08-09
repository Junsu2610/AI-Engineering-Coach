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

describe('benchmark model script', () => {
  it('rejects an unsupported harness before writing registry or config files', () => {
    const root = mkdtempSync(join(tmpdir(), 'aic-benchmark-model-'));
    try {
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

      const result = spawnSync(
        process.execPath,
        [scriptPath, 'claude', 'gpt5.6high'],
        { cwd: root, encoding: 'utf8', windowsHide: true },
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Unknown harness "claude"');
      expect(readFileSync(registryPath, 'utf8')).toBe(registry);
      expect(readdirSync(benchmarksDirectory)).toEqual(['models.json']);
    } finally {
      rmSync(root, { recursive: true, force: true, maxRetries: 3 });
    }
  });
});
