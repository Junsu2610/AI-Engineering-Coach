export function serializeRecord(record) {
  const serializable = Object.fromEntries(
    Object.entries(record).filter(([, value]) => Boolean(value)),
  );
  return JSON.stringify(serializable);
}
