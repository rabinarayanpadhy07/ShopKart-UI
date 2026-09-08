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

export async function getCartItems(options = {}) {
  const cacheKey = 'cart:items';
  const cached = apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }

  const data = await request('/api/cart/items', options);
  if (data) {
    apiCache.set(cacheKey, data, 15000); // short TTL - cart contents change often
  }
  return data;
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
