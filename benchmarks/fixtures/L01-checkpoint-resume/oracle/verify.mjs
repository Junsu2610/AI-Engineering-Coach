import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const workspaceArgument = process.argv[2];
if (workspaceArgument === undefined) {
  throw new Error('Usage: node verify.mjs <workspace>');
}
const workspace = resolve(workspaceArgument);

const module = await import(pathToFileURL(join(workspace, 'src', 'migrate.mjs')).href);
assert.equal(typeof module.migrateUsers, 'function');

const expectedInput = [
  { id: 'u-1', legacyName: 'Ada Lovelace', tier: 'pro' },
  {
    id: 'u-2',
    profile: { name: 'Grace Hopper' },
    legacyName: 'Grace Hopper',
    flags: ['verified'],
  },
];
const fixtureInput = JSON.parse(
  readFileSync(join(workspace, 'data', 'users.json'), 'utf8'),
);
assert.deepEqual(fixtureInput, expectedInput);
const migrated = module.migrateUsers(expectedInput);
assert.deepEqual(migrated, [
  { id: 'u-1', tier: 'pro', profile: { name: 'Ada Lovelace' } },
  { id: 'u-2', profile: { name: 'Grace Hopper' }, flags: ['verified'] },
]);
assert.deepEqual(module.migrateUsers(migrated), migrated);

const checkpoint = readFileSync(join(workspace, 'CHECKPOINT.md'), 'utf8');
assert.match(checkpoint, /scope|accepted/i);
assert.match(checkpoint, /implementation|stage two|stage 2/i);
assert.match(checkpoint, /npm test|verification/i);

const handoff = readFileSync(join(workspace, 'MIGRATION_HANDOFF.md'), 'utf8');
assert.match(handoff, /interrupt|resume/i);
assert.match(handoff, /npm test/i);
assert.match(handoff, /residual risk|risk/i);

console.log(JSON.stringify({ passed: true, cases: 6 }));
