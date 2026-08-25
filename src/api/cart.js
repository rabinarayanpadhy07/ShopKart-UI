import { request } from './client';

export function getCartCount() {
  return request('/api/cart/items/count');
}

export function getCartItems() {
  return request('/api/cart/items');
}

export function addToCart(productId) {
  return request('/api/cart/add', { method: 'POST', body: { productId } });
}

export function updateCartItem(productId, quantity) {
  return request('/api/cart/update', { method: 'PUT', body: { productId, quantity } });
}

export function removeCartItem(productId) {
  return request('/api/cart/delete', { method: 'DELETE', body: { productId } });
}
