import test from 'node:test';
import assert from 'node:assert/strict';
import { CausalLogNode } from '../src/causal-log.mjs';

test('resolves vector clock causality and out-of-order partitions correctly', () => {
  const nodeA = new CausalLogNode('A', ['A', 'B', 'C']);
  const nodeB = new CausalLogNode('B', ['A', 'B', 'C']);
  const nodeC = new CausalLogNode('C', ['A', 'B', 'C']);

  // Node A creates root event
  const eA1 = nodeA.recordEvent('A-root');

  // Node B receives A-root, then creates B-step1 and B-step2
  nodeB.receiveEvents([eA1]);
  const eB1 = nodeB.recordEvent('B-step1');
  const eB2 = nodeB.recordEvent('B-step2');

  // Node A creates A-independent
  const eA2 = nodeA.recordEvent('A-step2');

  // Node C receives eB2, eA2, eB1, eA1 completely out of order
  nodeC.receiveEvents([eB2, eA2, eB1, eA1]);

  const historyC = nodeC.getCausalHistory();

  // A-root MUST precede B-step1 and B-step2
  const idxRoot = historyC.indexOf('A-root');
  const idxB1 = historyC.indexOf('B-step1');
  const idxB2 = historyC.indexOf('B-step2');

  assert.ok(idxRoot !== -1 && idxB1 !== -1 && idxB2 !== -1);
  assert.ok(idxRoot < idxB1, 'A-root must precede B-step1');
  assert.ok(idxB1 < idxB2, 'B-step1 must precede B-step2');
});
