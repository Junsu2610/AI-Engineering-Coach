export function parsePair(line) {
  const [key = '', value = ''] = String(line).split('=');
  return { key: key.trim(), value: value.trim() };
}
