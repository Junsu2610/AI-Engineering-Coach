import test from 'node:test';
import assert from 'node:assert/strict';
import { MacroExpander } from '../src/macro-expander.mjs';

test('prevents infinite recursion in circular macro expansions', () => {
  const registry = new Map();
  registry.set('A', (args) => ({ type: 'MacroCall', name: 'B', args }));
  registry.set('B', (args) => ({ type: 'MacroCall', name: 'A', args }));

  const expander = new MacroExpander(registry);

  assert.throws(
    () => expander.expandMacro({ type: 'MacroCall', name: 'A', args: [] }),
    /Circular macro expansion detected/i,
  );
});
