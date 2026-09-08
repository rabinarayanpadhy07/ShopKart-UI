/**
 * Lightweight client-side memory cache with Time-To-Live (TTL).
 * Prevents redundant network roundtrips for stable datasets
 * (categories, filters, suggestions, and cart count).
 */

class SimpleCache {
  constructor() {
    this.store = new Map();
    this.listeners = new Set();
  }

  set(key, data, ttlMs = 60000) {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { data, expiresAt });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  has(key) {
    return this.get(key) !== null;
  }

  invalidate(keyOrPrefix) {
    for (const key of this.store.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.store.delete(key);
      }
    }
    this.notifyListeners(keyOrPrefix);
  }

  clear() {
    this.store.clear();
    this.notifyListeners('*');
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(key) {
    for (const listener of this.listeners) {
      try {
        listener(key);
      } catch (err) {
        console.error('Cache listener error:', err);
      }
    }
  }
}

export const apiCache = new SimpleCache();
