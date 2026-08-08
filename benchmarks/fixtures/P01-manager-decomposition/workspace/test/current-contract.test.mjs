import test from 'node:test';
import assert from 'node:assert/strict';

import { parseRecord } from '../src/parser.mjs';
import { saveRecord } from '../src/store.mjs';

test('preserves the current single-record behavior', () => {
  const store = new Map();
  const record = parseRecord('a,first');
  assert.deepEqual(saveRecord(store, record), { id: 'a', value: 'first' });
});
