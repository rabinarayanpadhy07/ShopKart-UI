const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function request(path, options = {}) {
  const { body, headers, parse = 'json', ...rest } = options;

  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      ...(body !== undefined ? JSON_HEADERS : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
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
