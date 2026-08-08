export function parseRecord(line) {
  const [id, value] = String(line).split(',');
  return { id, value };
}
