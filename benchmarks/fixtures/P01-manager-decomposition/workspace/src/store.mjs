export function saveRecord(store, record) {
  store.set(record.id, record);
  return record;
}
