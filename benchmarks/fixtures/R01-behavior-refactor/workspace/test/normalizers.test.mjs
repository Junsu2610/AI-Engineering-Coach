import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeAdmin, normalizeUser } from '../src/normalizers.mjs';

test('keeps user normalization behavior', () => {
  assert.deepEqual(normalizeUser({ name: ' Ada ', email: ' ADA@EXAMPLE.COM ' }), {
    name: 'Ada',
    email: 'ada@example.com',
  });
});

test('keeps admin normalization behavior', () => {
  assert.deepEqual(normalizeAdmin({
    name: ' Root ',
    email: ' ROOT@EXAMPLE.COM ',
    permissions: ['write', 'read'],
  }), {
    name: 'Root',
    email: 'ROOT@EXAMPLE.COM',
    permissions: ['read', 'write'],
  });
});

test('keeps the exact validation error', () => {
  assert.throws(() => normalizeUser({ name: '   ' }), { message: 'Name is required.' });
  assert.throws(() => normalizeAdmin({ name: '' }), { message: 'Name is required.' });
});
