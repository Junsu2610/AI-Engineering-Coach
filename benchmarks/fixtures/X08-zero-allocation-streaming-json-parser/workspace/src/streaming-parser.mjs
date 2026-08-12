export class ZeroAllocStreamParser {
  constructor() {
    this.buffer = '';
  }

  feedChunk(uint8Chunk) {
    // Buggy implementation: converts raw bytes to string chunk-by-chunk without handling multi-byte UTF-8 boundary splits
    const chunkStr = String.fromCharCode(...uint8Chunk);
    this.buffer += chunkStr;
  }

  parseTokens() {
    // Buggy fallback using JSON.parse (causes Out Of Memory under stress)
    try {
      return JSON.parse(this.buffer);
    } catch {
      throw new Error('Streaming JSON Parse Error: Unexpected token');
    }
  }
}
