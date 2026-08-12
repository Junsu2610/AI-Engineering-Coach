export class EventStateMachine {
  constructor() {
    this.state = 'CREATED';
    this.lastProcessedSeq = 0;
    this.pendingBuffer = new Map();
    this.locked = false;
    this.history = [];
  }

  async processEvent(event) {
    if (this.locked) {
      throw new Error('Livelock: Resource busy');
    }
    this.locked = true;
    await new Promise(r => setImmediate(r));

    try {
      const { seq, type, payload } = event;
      if (seq <= this.lastProcessedSeq) {
        // Already processed or duplicate
        return { status: 'IGNORED', state: this.state };
      }

      if (seq !== this.lastProcessedSeq + 1) {
        // Out of order: buffer it
        this.pendingBuffer.set(seq, event);
        return { status: 'BUFFERED', state: this.state };
      }

      // Valid next sequence
      this.applyTransition(type, payload);
      this.lastProcessedSeq = seq;
      this.history.push({ seq, type, state: this.state });

      // Drain buffer if consecutive sequences exist
      let nextSeq = this.lastProcessedSeq + 1;
      while (this.pendingBuffer.has(nextSeq)) {
        const nextEvent = this.pendingBuffer.get(nextSeq);
        this.pendingBuffer.delete(nextSeq);
        this.applyTransition(nextEvent.type, nextEvent.payload);
        this.lastProcessedSeq = nextSeq;
        this.history.push({ seq: nextSeq, type: nextEvent.type, state: this.state });
        nextSeq++;
      }

      return { status: 'PROCESSED', state: this.state };
    } finally {
      this.locked = false;
    }
  }

  applyTransition(type, payload) {
    if (type === 'START') {
      if (this.state !== 'CREATED') throw new Error(`Invalid transition ${type} from ${this.state}`);
      this.state = 'PROCESSING';
    } else if (type === 'STEP') {
      if (this.state !== 'PROCESSING') throw new Error(`Invalid transition ${type} from ${this.state}`);
      // remain in PROCESSING
    } else if (type === 'COMPLETE') {
      if (this.state !== 'PROCESSING') throw new Error(`Invalid transition ${type} from ${this.state}`);
      this.state = 'COMPLETED';
    } else if (type === 'FAIL') {
      this.state = 'FAILED';
    } else {
      throw new Error(`Unknown event type: ${type}`);
    }
  }
}
