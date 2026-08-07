export function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateCheckoutTotal(items, taxRate = 0) {
  const subtotal = items.reduce(
    (total, item) => total + roundCurrency(item.price * item.quantity),
    0,
  );
  return roundCurrency(subtotal * (1 + taxRate));
}
