/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { selectFullScenarioIds } from './cli';
import { FULL_SCENARIO_IDS } from './pilot';
import type { BenchmarkSuite } from './types';

function readSuite(): BenchmarkSuite {
  return JSON.parse(
    readFileSync(resolve('benchmarks/model-harness-suite.json'), 'utf8'),
  ) as BenchmarkSuite;
}

describe('full benchmark selection', () => {
  it('selects all executable manager, coder, and shared scenarios', () => {
    const suite = readSuite();
    const all = selectFullScenarioIds(suite, 'all');
    const manager = selectFullScenarioIds(suite, 'manager');
    const coder = selectFullScenarioIds(suite, 'coder');

    expect(all).toEqual([...FULL_SCENARIO_IDS]);
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
