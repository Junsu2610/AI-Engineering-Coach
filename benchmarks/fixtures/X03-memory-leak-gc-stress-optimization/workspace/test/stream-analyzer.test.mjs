import test from 'node:test';
import assert from 'node:assert/strict';
import { StreamAnalyzer } from '../src/stream-analyzer.mjs';

test('analyzes stream without memory leaks', () => {
  const analyzer = new StreamAnalyzer();
  let count = 0;
  analyzer.on('line', () => { count++; });
  analyzer.processLine('log entry');
  assert.equal(count, 1);
  analyzer.clear();
  assert.equal(analyzer.listenerCount('line'), 0);
});
