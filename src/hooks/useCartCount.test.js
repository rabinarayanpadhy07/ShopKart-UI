import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCartCount } from './useCartCount';
import * as cartApi from '@/api/cart';

describe('useCartCount', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not fetch and reports 0 when disabled (guest user)', async () => {
    const spy = vi.spyOn(cartApi, 'getCartCount');
    const { result } = renderHook(() => useCartCount({ username: 'Guest' }));

    expect(result.current.cartCount).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('fetches and reports the count when enabled for a logged-in user', async () => {
    vi.spyOn(cartApi, 'getCartCount').mockResolvedValue(3);
    const { result } = renderHook(() => useCartCount({ username: 'john' }));

    await waitFor(() => expect(result.current.cartCount).toBe(3));
    expect(result.current.loading).toBe(false);
  });

  it('falls back to 0 if the count fetch fails', async () => {
    vi.spyOn(cartApi, 'getCartCount').mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useCartCount({ username: 'john' }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cartCount).toBe(0);
  });
});
