import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateCheckoutTotal } from '../src/checkout-total.mjs';

test('preserves fractional cents until the final total is rounded', () => {
  const items = [
    { price: 0.335, quantity: 3 },
    { price: 0.335, quantity: 3 },
  ];
  assert.equal(calculateCheckoutTotal(items), 2.01);
});
