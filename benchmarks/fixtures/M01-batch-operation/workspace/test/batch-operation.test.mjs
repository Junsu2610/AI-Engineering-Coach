import test from 'node:test';
import assert from 'node:assert/strict';

import { runBatchCommand } from '../src/command-adapter.mjs';
import { processBatch } from '../src/item-service.mjs';

test('keeps successful and failed results in input order', () => {
  const items = [
    { id: 'a', value: ' first ' },
    { id: 'b', fail: true },
    { id: 'c', value: 'third' },
  ];
  assert.deepEqual(processBatch(items), [
    { ok: true, value: { id: 'a', value: 'first' } },
    { ok: false, error: 'Item b failed.' },
    { ok: true, value: { id: 'c', value: 'third' } },
  ]);
});

test('command adapter returns the batch result contract', () => {
  assert.deepEqual(runBatchCommand({ items: [] }), { results: [] });
});
