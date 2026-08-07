export function validateProfile(profile) {
  const errors = [];
  if (typeof profile.displayName !== 'string' || profile.displayName.length === 0) {
    errors.push('Display name is required.');
  }
  if (typeof profile.email !== 'string' || !profile.email.includes('@')) {
    errors.push('A valid email is required.');
  }
  return errors;
}
