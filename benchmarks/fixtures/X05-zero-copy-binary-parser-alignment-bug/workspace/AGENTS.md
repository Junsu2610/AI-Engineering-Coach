# X05 Zero-Copy Binary Log Decoder Alignment Bug

Fix binary log chunk decoder endianness and word alignment bugs in `src/binary-log-decoder.mjs`.

## Task Rules
- Support packed 64-bit BigInt timestamps in both Big-Endian (BE) and Little-Endian (LE) byte orders.
- Fix byte alignment offsets when reading variable-length UTF-8 log message payloads.
- Handle corrupted magic header frames (expected header `0x4C4F4753` / `LOGS`) by skipping corrupt bytes gracefully.
- Must pass `npm test` with zero buffer overflows or NaN timestamp conversions.
