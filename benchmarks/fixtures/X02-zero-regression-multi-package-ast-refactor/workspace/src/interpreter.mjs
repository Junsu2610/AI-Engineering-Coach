export function evaluateExpression(expr, context = {}) {
  if (typeof expr !== 'string') return 0;
  // Unsafe initial implementation
  const safeKeys = Object.keys(context);
  const safeVals = Object.values(context);
  try {
    const fn = new Function(...safeKeys, `return ${expr};`);
    return fn(...safeVals);
  } catch {
    return 0;
  }
}
