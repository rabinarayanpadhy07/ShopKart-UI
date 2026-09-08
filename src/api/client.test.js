import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { request } from './client';

describe('request', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('sends JSON body with the right headers and credentials', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    await request('/api/things', { method: 'POST', body: { a: 1 } });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/things',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ a: 1 }),
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('returns parsed JSON on success', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ hello: 'world' }),
    });

    const data = await request('/api/things');
    expect(data).toEqual({ hello: 'world' });
  });

  it('throws an Error using the server-provided message on failure', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad input' }),
    });

    await expect(request('/api/things')).rejects.toThrow('Bad input');
  });

  it('attaches the HTTP status to the thrown error', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Too many requests' }),
    });

    try {
      await request('/api/things');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err.status).toBe(429);
    }
  });

  it('falls back to a generic message when the error body has no message', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => null,
    });

    await expect(request('/api/things')).rejects.toThrow('Request failed');
  });

  it('does not JSON-encode FormData bodies', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    const formData = new FormData();
    formData.append('file', 'contents');

    await request('/api/upload', { method: 'POST', body: formData });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.body).toBe(formData);
    expect(options.headers['Content-Type']).toBeUndefined();
  });
});
