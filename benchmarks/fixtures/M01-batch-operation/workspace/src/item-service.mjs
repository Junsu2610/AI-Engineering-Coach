export function processItem(item) {
  if (typeof item?.id !== 'string' || item.id.length === 0) {
    throw new Error('Item id is required.');
  }
  if (item.fail === true) {
    throw new Error(`Item ${item.id} failed.`);
  }
  return { id: item.id, value: String(item.value ?? '').trim() };
}

export function processBatch(_items) {
  throw new Error('Batch operation is not implemented.');
}
