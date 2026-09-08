import { request } from './client';
import { apiCache } from './cache';

export function createPaymentOrder(amount, addressId) {
  return request('/api/payment/create', {
    method: 'POST',
    body: { amount, addressId },
  });
}

export async function verifyPayment(paymentDetails) {
  const res = await request('/api/payment/verify', {
    method: 'POST',
    body: paymentDetails,
  });
  apiCache.invalidate('cart');
  return res;
}
