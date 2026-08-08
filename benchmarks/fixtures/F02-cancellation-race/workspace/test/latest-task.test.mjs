import test from 'node:test';
import assert from 'node:assert/strict';

import { createLatestTaskRunner } from '../src/latest-task.mjs';

function deferred() {
  let resolve;
  const promise = new Promise(done => {
    resolve = done;
  });
  return { promise, resolve };
}

test('ignores stale work that finishes after a newer request starts', async () => {
  const first = deferred();
  const second = deferred();
  const applied = [];
  const runner = createLatestTaskRunner(value => applied.push(value));

  const firstRun = runner.start(() => first.promise);
  const secondRun = runner.start(() => second.promise);
  first.resolve('stale');
  second.resolve('latest');
  await Promise.all([firstRun, secondRun]);

  assert.deepEqual(applied, ['latest']);
});
