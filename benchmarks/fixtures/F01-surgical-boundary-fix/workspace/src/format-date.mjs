export function formatIsoDate(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}
