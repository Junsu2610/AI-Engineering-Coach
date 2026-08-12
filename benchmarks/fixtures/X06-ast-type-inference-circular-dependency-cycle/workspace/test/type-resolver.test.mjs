import test from 'node:test';
import assert from 'node:assert/strict';
import { TypeResolver } from '../src/type-resolver.mjs';

test('resolves mutually circular generic type definitions without stack overflow', () => {
  const typeMap = {
    'UserNode': {
      kind: 'object',
      fields: {
        id: 'string',
        parent: 'UserNode',
        friend: 'ProfileNode'
      }
    },
    'ProfileNode': {
      kind: 'object',
      fields: {
        owner: 'UserNode'
      }
    }
  };

  const resolver = new TypeResolver(typeMap);
  const result = resolver.resolveType('UserNode');

  assert.ok(result);
  assert.equal(result.kind, 'object');
  assert.equal(result.fields.parent.kind, 'cyclic');
  assert.equal(result.fields.parent.name, 'UserNode');
  assert.equal(result.fields.friend.fields.owner.kind, 'cyclic');
});
