# X06 AST Type Inference Circular Dependency Cycle

Fix infinite recursion and stack overflow in `src/type-resolver.mjs` when resolving cyclic type definitions.

## Task Rules
- Detect circular type alias references (e.g. `type Node = { child?: Node }` or `type A = B; type B = A;`).
- Implement memoization / visitor depth limits during structural type resolution.
- Ensure cyclic type graphs return structural equivalence representations without throwing `RangeError: Maximum call stack size exceeded`.
- Pass `npm test`.
