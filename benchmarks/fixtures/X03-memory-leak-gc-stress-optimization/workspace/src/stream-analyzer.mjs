import { EventEmitter } from 'node:events';

export class StreamAnalyzer extends EventEmitter {
  constructor() {
    super();
    this.buffer = [];
  }

  processLine(line) {
    this.buffer.push(line);
    this.emit('line', line);
  }

  clear() {
    this.buffer = [];
    this.removeAllListeners();
  }
}
