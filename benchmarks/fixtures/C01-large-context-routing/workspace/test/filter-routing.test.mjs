import test from 'node:test';
import assert from 'node:assert/strict';

import { pageFilterLabel } from '../src/filter-page.mjs';
import { panelFilterLabel } from '../src/filter-panel.mjs';
import { updateFilterState } from '../src/filter-state.mjs';

test('routes the shared filter state to both consumers', () => {
  const state = updateFilterState({ items: [] }, '  open  ');
  assert.equal(pageFilterLabel(state), 'open');
  assert.equal(panelFilterLabel(state), 'open');
});

test('does not use a similarly named legacy state branch', () => {
  const state = updateFilterState({ legacyFilters: { query: 'wrong' } }, 'right');
  assert.equal(pageFilterLabel(state), 'right');
  assert.equal(panelFilterLabel(state), 'right');
});
