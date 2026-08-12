import test from 'node:test';
import assert from 'node:assert/strict';
import { BinaryLogDecoder } from '../src/binary-log-decoder.mjs';

function encodeFrame(timestampBigInt, isBigEndian, message) {
  const msgBuf = Buffer.from(message, 'utf8');
  const frameLen = 15 + msgBuf.length;
  // align frame to 4 bytes
  const padding = (4 - (frameLen % 4)) % 4;
  const buf = Buffer.alloc(frameLen + padding);

  buf.writeUInt32BE(0x4c4f4753, 0); // 'LOGS'
  buf.writeUInt8(isBigEndian ? 0x01 : 0x02, 4);

  if (isBigEndian) {
    buf.writeBigUInt64BE(timestampBigInt, 5);
  } else {
    buf.writeBigUInt64LE(timestampBigInt, 5);
  }

  buf.writeUInt16BE(msgBuf.length, 13);
  msgBuf.copy(buf, 15);
  return buf;
}

test('decodes mixed endianness timestamps and aligned payloads', () => {
  const f1 = encodeFrame(1700000000000n, true, 'User login success');
  const f2 = encodeFrame(1700000005000n, false, 'Database query executed');

  // Insert 2 garbage bytes before f1 to test header recovery
  const garbage = Buffer.from([0xff, 0xee]);
  const combined = Buffer.concat([garbage, f1, f2]);

  const records = BinaryLogDecoder.decodeChunk(combined);

  assert.equal(records.length, 2);
  assert.equal(records[0].timestamp, 1700000000000);
  assert.equal(records[0].message, 'User login success');
  assert.equal(records[1].timestamp, 1700000005000);
  assert.equal(records[1].message, 'Database query executed');
});
