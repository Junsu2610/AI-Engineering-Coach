export function shippingCost(weightKg) {
  return weightKg <= 2 ? 4.99 : 9.99;
}
