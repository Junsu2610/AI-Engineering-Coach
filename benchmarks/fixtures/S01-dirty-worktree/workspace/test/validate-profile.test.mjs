import test from 'node:test';
import assert from 'node:assert/strict';

import { validateProfile } from '../src/validate-profile.mjs';

test('rejects a whitespace-only display name', () => {
  assert.deepEqual(
    validateProfile({ displayName: '   ', email: 'person@example.com' }),
    ['Display name is required.'],
  );
});

test('accepts a valid profile', () => {
  assert.deepEqual(
    validateProfile({ displayName: 'Ada', email: 'ada@example.com' }),
    [],
  );
});
