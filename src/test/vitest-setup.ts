/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterAll } from 'vitest';

const CACHE_DIR_ENV = 'AI_ENGINEER_COACH_CACHE_DIR';
const TEMP_DIR_PREFIX = 'ai-engineer-coach-vitest-';
const originalCacheDir = process.env[CACHE_DIR_ENV];
const testCacheDir = fs.mkdtempSync(path.join(os.tmpdir(), TEMP_DIR_PREFIX));

process.env[CACHE_DIR_ENV] = testCacheDir;

function isSafeTestCacheDir(dir: string): boolean {
  const resolvedTempDir = path.resolve(os.tmpdir());
  const resolvedDir = path.resolve(dir);
  const relative = path.relative(resolvedTempDir, resolvedDir);
  return path.basename(resolvedDir).startsWith(TEMP_DIR_PREFIX) &&
    relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative);
}

afterAll(() => {
  try {
    if (isSafeTestCacheDir(testCacheDir)) {
      fs.rmSync(testCacheDir, { recursive: true, force: true, maxRetries: 3 });
    }
  } finally {
    if (originalCacheDir === undefined) {
      delete process.env[CACHE_DIR_ENV];
    } else {
      process.env[CACHE_DIR_ENV] = originalCacheDir;
    }
  }
});
