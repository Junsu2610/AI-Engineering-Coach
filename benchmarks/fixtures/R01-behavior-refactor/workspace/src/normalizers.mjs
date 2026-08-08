export function normalizeUser(record) {
  if (typeof record?.name !== 'string' || record.name.trim().length === 0) {
    throw new Error('Name is required.');
  }
  const name = record.name.trim();
  return {
    name,
    email: String(record.email ?? '').trim().toLowerCase(),
  };
}

export function normalizeAdmin(record) {
  if (typeof record?.name !== 'string' || record.name.trim().length === 0) {
    throw new Error('Name is required.');
  }
  const name = record.name.trim();
  return {
    name,
    email: String(record.email ?? '').trim(),
    permissions: [...(record.permissions ?? [])].sort(),
  };
}
