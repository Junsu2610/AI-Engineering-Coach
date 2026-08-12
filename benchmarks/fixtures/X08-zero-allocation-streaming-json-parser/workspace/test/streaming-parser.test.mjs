import test from 'node:test';
import assert from 'node:assert/strict';
import { ZeroAllocStreamParser } from '../src/streaming-parser.mjs';

test('parses multi-byte UTF-8 emoji split across chunk boundaries', () => {
  const parser = new ZeroAllocStreamParser();
  const fullJson = '{"msg": "Hello 💩 World", "count": 100}';
  const encoder = new TextEncoder();
  const bytes = encoder.encode(fullJson);

  // Split multi-byte emoji right in the middle (e.g. at offset 16)
  const chunk1 = bytes.slice(0, 16);
  const chunk2 = bytes.slice(16);

  parser.feedChunk(chunk1);
  parser.feedChunk(chunk2);

  const parsed = parser.parseTokens();
  assert.deepEqual(parsed, { msg: 'Hello 💩 World', count: 100 });
});
