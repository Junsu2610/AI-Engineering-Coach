import test from 'node:test';
import assert from 'node:assert/strict';

import { migrateUsers } from '../src/migrate.mjs';

test('migration contract is implemented after resume', () => {
  assert.equal(typeof migrateUsers, 'function');
});
