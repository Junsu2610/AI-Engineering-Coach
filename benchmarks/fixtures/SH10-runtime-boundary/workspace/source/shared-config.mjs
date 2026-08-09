/**
 * Canonical source config. Deploy copies resolved values to runtime-mirror.
 * BUG: default port still points at old host mapping.
 */
export const DEFAULT_GATEWAY_PORT = 9000;

export function resolveGatewayPort(override) {
  if (override !== undefined && override !== null && override !== '') {
    return Number(override);
  }
  return DEFAULT_GATEWAY_PORT;
}
