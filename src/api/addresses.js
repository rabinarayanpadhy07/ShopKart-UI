import { request } from './client';
import { apiCache } from './cache';

export async function getAddresses(options = {}) {
  const cacheKey = 'addresses:list';
  const cached = apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }

  const data = await request('/api/addresses', options);
  if (data) {
    apiCache.set(cacheKey, data, 60000); // 1 minute TTL
  }
  return data;
}

export async function createAddress(payload) {
  const res = await request('/api/addresses', { method: 'POST', body: payload });
  apiCache.invalidate('addresses');
  return res;
}

export async function updateAddress(id, payload) {
  const res = await request(`/api/addresses/${id}`, { method: 'PUT', body: payload });
  apiCache.invalidate('addresses');
  return res;
}

export async function deleteAddress(id) {
  const res = await request(`/api/addresses/${id}`, { method: 'DELETE' });
  apiCache.invalidate('addresses');
  return res;
}

export async function setDefaultAddress(id) {
  const res = await request(`/api/addresses/${id}/default`, { method: 'PUT' });
  apiCache.invalidate('addresses');
  return res;
}
