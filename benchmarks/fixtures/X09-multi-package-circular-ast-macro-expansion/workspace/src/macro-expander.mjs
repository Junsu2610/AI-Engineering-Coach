export class MacroExpander {
  constructor(registry = new Map()) {
    this.registry = registry;
  }

  expandMacro(ast) {
    if (!ast || typeof ast !== 'object') return ast;

    if (ast.type === 'MacroCall') {
      const transformer = this.registry.get(ast.name);
      if (!transformer) {
        throw new Error(`Unknown macro: ${ast.name}`);
      }
      // Buggy recursive expansion without depth tracking or cycle detection causes infinite call stack
      const expanded = transformer(ast.args);
      return this.expandMacro(expanded);
    }

    if (Array.isArray(ast.children)) {
      return { ...ast, children: ast.children.map(c => this.expandMacro(c)) };
    }

    return ast;
  }
}
