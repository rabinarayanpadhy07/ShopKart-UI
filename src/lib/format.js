const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** Formats a price in Indian Rupees with lakh/crore digit grouping, e.g. ₹1,39,999. */
export function formatPrice(value) {
  const n = Number(value);
  return `₹${inr.format(Number.isFinite(n) ? n : 0)}`;
}

/** Orders above this amount ship free; mirrored in the header strip and product page. */
export const FREE_DELIVERY_THRESHOLD = 499;

/** Turns backend status codes like OUT_FOR_DELIVERY into "Out for delivery". */
export function formatStatus(status) {
  if (!status) return '';
  const text = String(status).replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
