export const DEFAULT_FEATURES = Object.freeze({ featureX: false });

export function readProjectFeatures(config) {
  return config?.features ?? {};
}
