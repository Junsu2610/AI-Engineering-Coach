import test from 'node:test';
import assert from 'node:assert/strict';

import { isWithinDateWindow } from '../src/date-window.mjs';

test('includes the configured end boundary', () => {
  assert.equal(isWithinDateWindow(20, 10, 20), true);
});

test('rejects a value after the window', () => {
  assert.equal(isWithinDateWindow(21, 10, 20), false);
});
