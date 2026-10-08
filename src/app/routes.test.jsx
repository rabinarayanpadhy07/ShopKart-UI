import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AppRoutes from './routes';
import { ToastProvider } from '@/components/ui/Toast';

afterEach(() => vi.unstubAllGlobals());

describe('AppRoutes', () => {
  it('redirects legacy /products/:id links to the product page', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Product not found' }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/products/42']}>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Product not found')).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/api/products/42'))).toBe(true);
  });
});
