export function resolveFeatureFlag({
  project = {},
  user = {},
  environment = {},
  defaults = {},
} = {}) {
  if (Object.hasOwn(project, 'featureX')) {
    return project.featureX;
  }
  if (Object.hasOwn(environment, 'FEATURE_X')) {
    return environment.FEATURE_X === 'on';
  }
  if (Object.hasOwn(user, 'featureX')) {
    return user.featureX;
  }
  return defaults.featureX ?? false;
}
