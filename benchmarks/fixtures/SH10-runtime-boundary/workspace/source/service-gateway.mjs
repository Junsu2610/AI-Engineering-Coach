import { resolveGatewayPort } from './shared-config.mjs';

export function createGatewayBinding(env = {}) {
  const port = resolveGatewayPort(env.GATEWAY_PORT);
  return { host: '0.0.0.0', port };
}
