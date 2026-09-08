import { request } from './client';

export function getOrders(options = {}) {
  return request('/api/orders', options);
}

export function cancelOrder(orderId, reason) {
  return request(`/api/orders/${orderId}/cancel`, {
    method: 'POST',
    body: { reason },
  });
}

export function returnOrder(orderId, reason) {
  return request(`/api/orders/${orderId}/return`, {
    method: 'POST',
    body: { reason },
  });
}

export function submitReview(productId, rating, comment) {
  return request('/api/reviews', {
    method: 'POST',
    body: { productId, rating, comment },
  });
}
