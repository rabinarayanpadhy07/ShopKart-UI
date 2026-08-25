import { request } from './client';

export function getProducts(params) {
  const query = new URLSearchParams(params);
  return request(`/api/products?${query.toString()}`);
}

export function getProductSuggestions(q) {
  return request(`/api/products/suggestions?q=${encodeURIComponent(q)}`);
}
