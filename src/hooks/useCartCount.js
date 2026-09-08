import { useCallback, useEffect, useState } from 'react';
import { getCartCount } from '@/api/cart';
import { apiCache } from '@/api/cache';

export function useCartCount(options = {}) {
  // Support either useCartCount({ enabled, username }) or useCartCount(isEnabled) or useCartCount(username)
  let enabled = false;
  if (typeof options === 'boolean') {
    enabled = options;
  } else if (typeof options === 'string') {
    enabled = Boolean(options && options !== 'Guest');
  } else if (options && typeof options === 'object') {
    if (options.enabled !== undefined) {
      enabled = Boolean(options.enabled);
    } else if (options.username !== undefined) {
      enabled = Boolean(options.username && options.username !== 'Guest');
    }
  }

  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (opts = {}) => {
    if (!enabled && !opts.force) {
      setCartCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const count = await getCartCount(opts);
      setCartCount(typeof count === 'number' ? count : 0);
    } catch {
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      refresh();
    } else {
      setCartCount(0);
      setLoading(false);
    }
  }, [enabled, refresh]);

  useEffect(() => {
    // Listen for cart cache invalidation events to auto-refresh cart count
    const unsubscribe = apiCache.subscribe((key) => {
      if (key === 'cart' || key === '*' || key === 'cart:count') {
        if (enabled) {
          refresh({ skipCache: true });
        }
      }
    });
    return unsubscribe;
  }, [enabled, refresh]);

  return { cartCount, loading, refresh };
}
