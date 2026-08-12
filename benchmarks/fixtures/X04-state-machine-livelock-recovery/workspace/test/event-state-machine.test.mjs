import test from 'node:test';
import assert from 'node:assert/strict';
import { EventStateMachine } from '../src/event-state-machine.mjs';

test('processes 100 concurrent out-of-order events without livelock', async () => {
  const machine = new EventStateMachine();
  const events = [];

  // Generate 100 events: 1 START, 98 STEP, 1 COMPLETE
  events.push({ seq: 1, type: 'START', payload: {} });
  for (let i = 2; i <= 99; i++) {
    events.push({ seq: i, type: 'STEP', payload: { step: i } });
  }
  events.push({ seq: 100, type: 'COMPLETE', payload: {} });

  // Shuffle events out-of-order
  const shuffled = [...events].sort(() => Math.random() - 0.5);

  // Dispatch all 100 concurrently
  const results = await Promise.all(shuffled.map(e => machine.processEvent(e)));

  assert.equal(machine.state, 'COMPLETED');
  assert.equal(machine.lastProcessedSeq, 100);
  assert.equal(machine.history.length, 100);
  assert.equal(results.length, 100);
});
