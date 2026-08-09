import test from 'node:test';
import assert from 'node:assert/strict';

import { createGatewayBinding } from '../source/service-gateway.mjs';
import { resolveGatewayPort } from '../source/shared-config.mjs';

test('resolveGatewayPort uses canonical default 20128', () => {
  assert.equal(resolveGatewayPort(), 20128);
});

test('createGatewayBinding without env uses canonical port', () => {
  const binding = createGatewayBinding();
  assert.equal(binding.port, 20128);
});

test('explicit env override still works', () => {
  const binding = createGatewayBinding({ GATEWAY_PORT: '8080' });
  assert.equal(binding.port, 8080);
});
