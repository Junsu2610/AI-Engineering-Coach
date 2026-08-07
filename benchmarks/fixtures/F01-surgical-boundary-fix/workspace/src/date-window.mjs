export function isWithinDateWindow(timestamp, startInclusive, endInclusive) {
  return timestamp >= startInclusive && timestamp < endInclusive;
}
