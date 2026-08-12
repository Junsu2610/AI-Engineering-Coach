export class TypeResolver {
  constructor(typeMap = {}) {
    this.typeMap = typeMap;
  }

  resolveType(name) {
    // Bug: No cycle tracking (visited set), causes infinite recursion & RangeError
    const def = this.typeMap[name];
    if (!def) {
      return { kind: 'primitive', name };
    }

    if (def.kind === 'alias') {
      return this.resolveType(def.target);
    }

    if (def.kind === 'object') {
      const resolvedFields = {};
      for (const [key, fieldTypeName] of Object.entries(def.fields)) {
        resolvedFields[key] = this.resolveType(fieldTypeName);
      }
      return { kind: 'object', fields: resolvedFields };
    }

    return def;
  }
}
