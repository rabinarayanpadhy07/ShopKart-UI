import { request } from './client';

export function addToWishlist(productId) {
  return request('/api/wishlist/add', { method: 'POST', body: { productId } });
}

export function getWishlist() {
  return request('/api/wishlist');
}

export function removeFromWishlist(productId) {
  return request(`/api/wishlist/remove/${productId}`, { method: 'DELETE' });
}

export function moveWishlistToCart(productId) {
  return request('/api/wishlist/move-to-cart', { method: 'POST', body: { productId } });
}
