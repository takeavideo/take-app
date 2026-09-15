export function formatRating(value: number) {
  return value.toFixed(value % 1 === 0 ? 1 : 1).replace('.', ',');
}
