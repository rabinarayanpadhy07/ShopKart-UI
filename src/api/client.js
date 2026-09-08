const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function request(path, options = {}) {
  const { body, headers, parse = 'json', signal, ...rest } = options;

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  const response = await fetch(url, {
    credentials: 'include',
    signal,
    headers: {
      ...(body !== undefined && !(body instanceof FormData) ? JSON_HEADERS : {}),
      ...headers,
    },
    body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    ...rest,
  });

  if (parse === 'none') return response;

  const data = parse === 'text'
    ? await response.text()
    : await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && (data.error || data.message)) ||
      (typeof data === 'string' && data) ||
      'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path, options = {}) => request(path, { method: 'GET', ...options }),
  post: (path, body, options = {}) => request(path, { method: 'POST', body, ...options }),
  put: (path, body, options = {}) => request(path, { method: 'PUT', body, ...options }),
  del: (path, options = {}) => request(path, { method: 'DELETE', ...options }),
};
