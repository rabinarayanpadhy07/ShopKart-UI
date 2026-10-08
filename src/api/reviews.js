import { request } from './client';

export function getProductReviews(productId, options = {}) {
  return request(`/api/reviews/product/${encodeURIComponent(productId)}`, options);
}

export function addReview(productId, rating, comment) {
  return request('/api/reviews', { method: 'POST', body: { productId, rating, comment } });
}
