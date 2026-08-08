import test from 'node:test';
import assert from 'node:assert/strict';

import { serializeRecord } from '../src/serializer.mjs';

test('preserves meaningful falsey values', () => {
  assert.equal(
    serializeRecord({ enabled: false, retries: 0, label: '', omitted: undefined }),
    '{"enabled":false,"retries":0,"label":""}',
  );
});

test('preserves insertion order', () => {
  assert.equal(serializeRecord({ second: 2, first: 1 }), '{"second":2,"first":1}');
});
