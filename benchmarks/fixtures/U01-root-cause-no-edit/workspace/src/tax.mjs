export function calculateTax(amount, rate) {
  return Math.round(amount * rate * 100) / 100;
}
