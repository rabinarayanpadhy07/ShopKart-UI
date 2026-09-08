import { request } from './client';
import { apiCache } from './cache';

export function getProducts(params = {}, options = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  }
  const queryString = query.toString();
  const path = queryString ? `/api/products?${queryString}` : '/api/products';
  return request(path, options);
}

export async function getProductSuggestions(q, options = {}) {
  const term = q.trim();
  if (term.length < 2) return { suggestions: [] };

  const cacheKey = `suggestions:${term.toLowerCase()}`;
  const cached = apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }

  const data = await request(`/api/products/suggestions?q=${encodeURIComponent(term)}`, options);
  if (data && data.suggestions) {
    apiCache.set(cacheKey, data, 60000); // 1 minute TTL
  }
  return data;
}

export async function getCategories(options = {}) {
  const cacheKey = 'categories:list';
  const cached = apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }

  const data = await request('/api/products/categories', options);
  if (data) {
    apiCache.set(cacheKey, data, 300000); // 5 minutes TTL
  }
  return data;
}

export async function getProductFilters(options = {}) {
  const cacheKey = 'products:filters';
  const cached = apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }

  const data = await request('/api/products/filters', options);
  if (data) {
    apiCache.set(cacheKey, data, 300000); // 5 minutes TTL
  }
  return data;
}
