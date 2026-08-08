import test from 'node:test';
import assert from 'node:assert/strict';

import { parsePair } from '../src/parser.mjs';

test('preserves equals signs inside the value', () => {
  assert.deepEqual(parsePair(' token = a=b=c '), { key: 'token', value: 'a=b=c' });
});

test('handles a key without an explicit value', () => {
  assert.deepEqual(parsePair(' enabled '), { key: 'enabled', value: '' });
});
