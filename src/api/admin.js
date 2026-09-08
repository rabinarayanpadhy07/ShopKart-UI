import { request } from './client';
import { apiCache } from './cache';

// Orders
export async function getAdminOrders(options = {}) {
  const cacheKey = 'admin:orders';
  const cached = apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }
  const data = await request('/admin/orders', options);
  if (data) {
    apiCache.set(cacheKey, data, 60000); // 1 minute TTL
  }
  return data;
}

export function getOrderHistory(orderId, options = {}) {
  return request(`/admin/orders/${orderId}/history`, options);
}

export async function updateOrderStatus(orderId, status, comments) {
  const res = await request(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: { status, comments },
  });
  apiCache.invalidate('admin:orders');
  apiCache.invalidate('admin:analytics');
  return res;
}

// Users
export async function getAdminUsers(options = {}) {
  const cacheKey = 'admin:users';
  const cached = apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }
  const data = await request('/admin/users', options);
  if (data) {
    apiCache.set(cacheKey, data, 60000);
  }
  return data;
}

export function getUserById(userId, options = {}) {
  return request(`/admin/users/${userId}`, options);
}

export async function modifyUser(userId, data) {
  const res = await request(`/admin/users/modify/${userId}`, {
    method: 'PUT',
    body: data,
  });
  apiCache.invalidate('admin:users');
  return res;
}

// Analytics
export async function getOverallAnalytics(options = {}) {
  const cacheKey = 'admin:analytics:overall';
  const cached = apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }
  const data = await request('/admin/analytics/overall', options);
  if (data) {
    apiCache.set(cacheKey, data, 60000);
  }
  return data;
}

export function getDailyAnalytics(date, options = {}) {
  return request(`/admin/analytics/daily?date=${encodeURIComponent(date)}`, options);
}

export function getMonthlyAnalytics(month, year, options = {}) {
  return request(`/admin/analytics/monthly?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`, options);
}

export function getYearlyAnalytics(year, options = {}) {
  return request(`/admin/analytics/yearly?year=${encodeURIComponent(year)}`, options);
}

// Products & Categories
export async function addAdminProduct(productData) {
  const res = await request('/admin/products/add', {
    method: 'POST',
    body: productData,
  });
  apiCache.invalidate('categories');
  apiCache.invalidate('products');
  return res;
}

export async function modifyAdminProduct(productId, productData) {
  const res = await request(`/admin/products/modify/${productId}`, {
    method: 'PUT',
    body: productData,
  });
  apiCache.invalidate('categories');
  apiCache.invalidate('products');
  return res;
}

export async function deleteAdminProduct(productId) {
  const res = await request(`/admin/products/delete/${productId}`, {
    method: 'DELETE',
  });
  apiCache.invalidate('categories');
  apiCache.invalidate('products');
  return res;
}

export async function addCategory(categoryName) {
  const res = await request('/admin/products/categories/add', {
    method: 'POST',
    body: { categoryName },
  });
  apiCache.invalidate('categories');
  return res;
}
