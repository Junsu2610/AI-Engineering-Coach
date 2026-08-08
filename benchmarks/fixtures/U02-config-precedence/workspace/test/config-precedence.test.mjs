import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveFeatureFlag } from '../src/config-resolver.mjs';

test('project value wins over every lower-precedence source', () => {
  assert.equal(resolveFeatureFlag({
    project: { featureX: false },
    environment: { FEATURE_X: 'on' },
    user: { featureX: true },
    defaults: { featureX: true },
  }), false);
});

test('environment is used when project is absent', () => {
  assert.equal(resolveFeatureFlag({
    environment: { FEATURE_X: 'on' },
    user: { featureX: false },
    defaults: { featureX: false },
  }), true);
});

test('user is used when project and environment are absent', () => {
  assert.equal(resolveFeatureFlag({
    user: { featureX: true },
    defaults: { featureX: false },
  }), true);
});

test('default is used when every explicit source is absent', () => {
  assert.equal(resolveFeatureFlag({ defaults: { featureX: true } }), true);
});
