import { processItem } from './item-service.mjs';

export function runBatchCommand(payload) {
  return { results: payload.items.map(processItem) };
}
