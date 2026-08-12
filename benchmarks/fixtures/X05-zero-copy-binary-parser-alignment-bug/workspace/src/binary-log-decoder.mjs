export class BinaryLogDecoder {
  static decodeChunk(buffer) {
    const records = [];
    let offset = 0;

    while (offset < buffer.length) {
      if (offset + 15 > buffer.length) {
        break; // Truncated tail
      }

      const magic = buffer.readUInt32BE(offset);
      if (magic !== 0x4c4f4753) { // 'LOGS'
        // Bug: Doesn't scan for magic header recovery, simply fails or reads bad offset
        throw new Error(`Corrupted magic header at offset ${offset}: 0x${magic.toString(16)}`);
      }

      const flags = buffer.readUInt8(offset + 4);
      // Bug: Always reads readBigUInt64LE ignoring flags byte (0x01 = BE, 0x02 = LE)
      const timestamp = buffer.readBigUInt64LE(offset + 5);

      const payloadLen = buffer.readUInt16BE(offset + 13);
      const payloadStart = offset + 15;
      const payloadEnd = payloadStart + payloadLen;

      if (payloadEnd > buffer.length) {
        break; // Out of bounds
      }

      const message = buffer.toString('utf8', payloadStart, payloadEnd);
      records.push({ timestamp: Number(timestamp), message, flags });

      // Bug: Missing word alignment calculation (+ payloadLen only, instead of padded 4-byte alignment)
      offset = payloadEnd;
    }

    return records;
  }
}
