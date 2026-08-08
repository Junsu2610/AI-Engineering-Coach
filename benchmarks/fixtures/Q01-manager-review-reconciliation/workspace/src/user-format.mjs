export function formatUser(user) {
  if (typeof user?.displayName !== 'string' || user.displayName.length === 0) {
    throw new Error('Display name is required.');
  }
  return { ...user, displayName: user.displayName };
}
