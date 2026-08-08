import test from 'node:test';
import assert from 'node:assert/strict';

import { formatUser } from '../src/user-format.mjs';

test('preserves the public formatter behavior', () => {
  assert.deepEqual(formatUser({ displayName: 'Ada' }), { displayName: 'Ada' });
});
