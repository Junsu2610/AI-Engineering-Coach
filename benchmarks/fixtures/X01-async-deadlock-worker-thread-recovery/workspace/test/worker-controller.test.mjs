import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkerController } from '../src/worker-controller.mjs';

test('handles high-concurrency tasks without deadlock', async () => {
  const controller = new WorkerController();
  const tasks = Array.from({ length: 10 }, (_, i) => controller.processTask({ data: i + 1 }));
  const results = await Promise.all(tasks);
  assert.deepEqual(results, [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
});
