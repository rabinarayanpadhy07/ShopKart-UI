import { request } from './client';
import { apiCache } from './cache';

export function addToWishlist(productId) {
  return request('/api/wishlist/add', { method: 'POST', body: { productId } });
}

export function getWishlist(options = {}) {
  return request('/api/wishlist', options);
}

export function removeFromWishlist(productId) {
  return request(`/api/wishlist/remove/${productId}`, { method: 'DELETE' });
}

export async function moveWishlistToCart(productId) {
  const res = await request('/api/wishlist/move-to-cart', { method: 'POST', body: { productId } });
  apiCache.invalidate('cart');
  return res;
}

