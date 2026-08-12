export class CausalLogNode {
  constructor(nodeId, nodes = []) {
    this.nodeId = nodeId;
    this.nodes = nodes;
    this.vectorClock = new Map(nodes.map(n => [n, 0]));
    this.vectorClock.set(nodeId, 0);
    this.log = [];
  }

  recordEvent(payload) {
    const current = this.vectorClock.get(this.nodeId) || 0;
    this.vectorClock.set(this.nodeId, current + 1);

    const event = {
      id: `${this.nodeId}-${Date.now()}-${Math.random()}`,
      origin: this.nodeId,
      clock: new Map(this.vectorClock),
      payload,
    };
    this.log.push(event);
    return event;
  }

  receiveEvents(incomingEvents) {
    // Buggy naive merge: relies on Date.now() instead of Causal Order Comparison
    for (const event of incomingEvents) {
      if (this.log.some(e => e.id === event.id)) continue;
      this.log.push(event);

      // Merge clock naively
      for (const [node, ticks] of event.clock.entries()) {
        const localTicks = this.vectorClock.get(node) || 0;
        if (ticks > localTicks) {
          this.vectorClock.set(node, ticks);
        }
      }
    }

    // Bug: Sorted by wall-clock timestamp instead of topological causal order
    this.log.sort((a, b) => a.id.localeCompare(b.id));
  }

  getCausalHistory() {
    return this.log.map(e => e.payload);
  }
}
