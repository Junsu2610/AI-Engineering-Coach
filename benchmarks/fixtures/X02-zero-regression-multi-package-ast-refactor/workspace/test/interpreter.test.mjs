import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression } from '../src/interpreter.mjs';

test('evaluates arithmetic expressions safely', () => {
  assert.equal(evaluateExpression('a + b * 2', { a: 5, b: 3 }), 11);
});
