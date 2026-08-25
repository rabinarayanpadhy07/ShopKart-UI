import { useCallback, useEffect, useState } from 'react';
import { getCartCount } from '@/api/cart';

export function useCartCount() {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const count = await getCartCount();
      setCartCount(typeof count === 'number' ? count : 0);
    } catch {
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { cartCount, loading, refresh };
}
