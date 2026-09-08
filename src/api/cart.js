import { request } from './client';
import { apiCache } from './cache';

export async function getCartCount(options = {}) {
  const cacheKey = 'cart:count';
  const cached = apiCache.get(cacheKey);
  if (typeof cached === 'number' && !options.skipCache) {
    return cached;
  }

  const count = await request('/api/cart/items/count', options);
  const num = typeof count === 'number' ? count : 0;
  apiCache.set(cacheKey, num, 30000); // 30 seconds TTL
  return num;
}

export function getCartItems(options = {}) {
  return request('/api/cart/items', options);
}

export async function addToCart(productId, quantity = 1) {
  const res = await request('/api/cart/add', {
    method: 'POST',
    body: { productId, quantity },
  });
  apiCache.invalidate('cart');
  return res;
}

export async function updateCartItem(productId, quantity) {
  const res = await request('/api/cart/update', {
    method: 'PUT',
    body: { productId, quantity },
  });
  apiCache.invalidate('cart');
  return res;
}

export async function removeCartItem(productId) {
  const res = await request(`/api/cart/delete?productId=${productId}`, {
    method: 'DELETE',
  });
  apiCache.invalidate('cart');
  return res;
}
